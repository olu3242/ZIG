# Null Safety Report

Scope: unguarded `.map(`/`.filter(`/`.reduce(`/chained property access on async-derived
(not literal) values across `apps/web` and `packages/*`, focused on frameworks, scenarios,
lessons, assessments, labs, and artifacts.

## Method

`grep -rn "\.map(\|\.filter(\|\.reduce("` was run against `apps/web/app/lib/data.ts`,
`apps/web/app/lib/lifecycle.ts`, and the dynamic-route pages, then each hit was traced back
to its source (literal array vs. network/service call) to classify guard status.

## Findings

### Safe: static-fixture-backed `.find()` calls in dynamic routes (no risk)
Every `[id]` route under `apps/web/app/learning`, `apps/web/app/labs`,
`apps/web/app/assessment`, `apps/web/app/risk`, `apps/web/app/vendors`, and
`apps/web/app/evidence` uses the pattern `array.find((item) => item.id === id) ??
array[0]` against `@/app/lib/mvp-data` literal arrays (e.g.
`apps/web/app/labs/[id]/page.tsx:9`, `apps/web/app/learning/lesson/[id]/page.tsx:9-11`,
`apps/web/app/vendors/[id]/page.tsx:17`). Because the source array is a hardcoded literal
(never empty, never async), this pattern cannot throw and cannot render blank -- the `??
array[0]` fallback guarantees a defined object. This is a deliberate (if slightly
deceptive -- a bad id silently shows the wrong record rather than erroring) safety pattern
applied consistently across ~9 routes.

### Risk: `apps/web/app/lib/data.ts:15` -- chained optional access into `.map`
```
const projects = lifecycleMetrics?.projects.map((project) => ({ ... })) ?? [];
```
This is *correctly* guarded: `lifecycleMetrics?.projects` short-circuits to `undefined` if
`lifecycleMetrics` is `null` (it can be, per `safeLoad(() => loadCreateLifecycleMetrics(...),
null)` at `data.ts:12`), and the outer `?? []` catches that. However, note the asymmetry: if
`lifecycleMetrics` is non-null but `lifecycleMetrics.projects` is itself `undefined` (e.g. a
shape change in `loadCreateLifecycleMetrics`'s return type), `undefined.map` would throw
*inside* the optional chain's right-hand evaluation only if `projects` itself is accessed
unguarded -- here it is `lifecycleMetrics?.projects.map(...)`, which means if
`lifecycleMetrics` is truthy but `projects` is `undefined`, this **will** throw
(`?.` only guards the `lifecycleMetrics` access, not `.projects`). Severity: **Medium** --
requires `loadCreateLifecycleMetrics` to return a malformed object, which is plausible but
not currently observed.

### Risk: `apps/web/app/lib/lifecycle.ts:150-151` -- `Map` keyed off async rows, then `.map`
```
const frameworkNames = new Map(frameworks.map((framework) => [framework.frameworkId, framework.name]));
return projects.map((row) => projectFromRow(row, frameworkNames.get(row.framework_focus)));
```
`frameworks` and `projects` both come from `restGet<...>(...)` (network calls). If `restGet`
ever returns `undefined` instead of `[]` on a malformed response, both `.map` calls would
throw uncaught -- there is no null-check on the `restGet` return value here. `restGet`
itself was not directly read in this pass, but `listLifecycleFrameworks` and
`listLifecycleProjects` both consume its result unguarded (`lifecycle.ts:132,151`). Severity:
**Medium** -- depends entirely on `restGet`'s contract holding (always array, never
null/undefined), which is unverified within this audit's read window.

### Critical: `apps/web/app/frameworks/[id]/page.tsx:9` -- no guard at all on the network call
```
const framework = await getZigServices().frameworks.findById(context, id);
if (!framework) { notFound(); }
```
The `if (!framework)` check only protects the case where `findById` *resolves* to `null`
(a real "not found" from PostgREST returning zero rows). It does **not** protect against
`findById` *rejecting* (throwing `DataAccessError` on a non-2xx response, e.g. the uuid-vs-
text 400 described in `FRAMEWORK_IDENTIFIER_AUDIT.md`). This is the single most severe null/
error-safety gap found in this pass: every other dynamic route in `apps/web` either uses a
literal-array fallback (safe) or a tolerant loader returning `null` on failure
(`getLifecycleProject`, safe), but this route calls a throwing network method directly with
zero try/catch. Severity: **Critical** (confirmed live crash, see `FRAMEWORK_IDENTIFIER_AUDIT.md`
and `ROUTE_HEALTH_REPORT.md`).

### Low: `apps/web/app/learning/[id]/page.tsx:18` -- `.reduce` over filtered literal data
```
value={modules.reduce((count, module) => count + lessons.filter((lesson) => lesson.moduleId === module.id).length, 0)}
```
`modules` and `lessons` are both derived from the literal `mvp-data.ts` arrays
(`learningModules`, `lessons`), so this cannot throw on missing data, only ever compute `0`
for a path with no modules. No empty-state messaging is shown for a `0`-module path other
than the `DataTable`'s `empty="No modules configured."` prop on the table immediately below
it (`learning/[id]/page.tsx:23`) -- so the stat card itself would silently show "0" rather
than an explanatory message, which is a minor UX gap rather than a crash risk.

### Not found: any `.map`/`.filter`/`.reduce` directly on `frameworks`, `scenarios`, `labs`,
`assessments`, or `artifacts` collections sourced from `packages/services` calls inside
`apps/web`, other than the one `frameworks/[id]` case above -- because (per
`SERVICE_DEPENDENCY_MAP.md`) those services are essentially unreferenced from `apps/web`.
The risk surface for this category is therefore narrow today, but will widen the moment any
of the dormant `RiskService`, `ControlService`, `EvidenceService`, `LearningService`, or
`ScenarioService` methods are wired into a route without the same defensive pattern used by
`getLifecycleProject`.

## Severity summary

| Location | Issue | Severity |
|---|---|---|
| `apps/web/app/frameworks/[id]/page.tsx:9` | Unguarded throwing call, no try/catch | Critical |
| `apps/web/app/lib/data.ts:15` | Partial optional chain (`?.` only covers first hop) | Medium |
| `apps/web/app/lib/lifecycle.ts:150-151` | Unverified `restGet` array contract | Medium |
| `apps/web/app/learning/[id]/page.tsx:18` | Silent `0` instead of empty-state text on stat card | Low |

## Recommended remediation

1. Wrap `getZigServices().frameworks.findById(...)` (and any future direct
   `packages/services` calls in `apps/web`) in the same `safeLoad`/try-catch pattern already
   used in `apps/web/app/lib/data.ts`'s `safeLoad` helper, or extend `getLifecycleProject`'s
   tolerant-null pattern to frameworks.
2. Replace `lifecycleMetrics?.projects.map(...)` with `(lifecycleMetrics?.projects ??
   []).map(...)` to guard both hops, not just the first.
3. Confirm and, if necessary, harden `restGet`'s contract to always resolve an array (never
   `undefined`/`null`) so downstream `.map` calls in `lifecycle.ts` are provably safe.
4. As any dormant `packages/services` method gets wired into `apps/web`, require a
   null/error-safe wrapper as a review gate, given the precedent this category of bug has
   already set.
