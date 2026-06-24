# Empty State Report

Scope: `CLAUDE.md`'s "zero empty states" rule ("No screen should ever be blank. Every
screen needs demo data, an AI-generation entry point, suggested actions, example records,
or a clear next step.") checked against the primary content routes: Learning, Frameworks,
Scenarios, Labs, Assessments, Artifacts, Portfolio, Career, Certifications.

## Method

For each route, the actual `page.tsx` (and where present, `loading.tsx`/`error.tsx`) was
read to determine whether the screen can render with zero backing rows, and if so, what
it shows.

## Findings

### 1. Scenarios — compliant, but admits to being unfinished (Low)
`apps/web/app/scenarios/page.tsx` (21 lines) is a fully static component. It does not
call any service or repository. It renders three `StatCard`s with literal values `"0"`,
`"N/A"`, `"0"` and a `Section` with the literal text "No scenario runs exist for this
tenant yet." This technically satisfies "a clear next step" only in the weakest sense —
there is no link, button, or AI-generation entry point, just prose. The page description
itself says "after the scenario service is connected to project data," i.e. the empty
state is permanent until backend work lands, not a transient empty state. Severity: Low
(it does not crash and does show text, but it does not meet the "AI-generation entry
point / suggested actions" bar CLAUDE.md sets).

### 2. Frameworks — violates the rule via crash, not blank screen (Critical, cross-ref)
`apps/web/app/frameworks/[id]/page.tsx:9` throws an uncaught `DataAccessError` for any
id that is not a literal UUID (see `FRAMEWORK_IDENTIFIER_AUDIT.md`). The resulting screen
is not "blank" — it is the `error.tsx` boundary at `apps/web/app/frameworks/error.tsx`,
literal text "Framework library needs a refresh". This is worse than an empty state: it
reads as a system fault to the user rather than "no data yet." Already covered in
`FRAMEWORK_IDENTIFIER_AUDIT.md` and `NULL_SAFETY_REPORT.md`; listed here because it is
the sharpest violation of the zero-empty-states spirit (an error screen is strictly worse
than an empty-with-CTA screen).

### 3. Learning — partially compliant (Medium)
`apps/web/app/learning/[id]/page.tsx:18` (per `NULL_SAFETY_REPORT.md`) uses a `.reduce`
stat card that renders `"0"` with no explanatory text when a learning path's modules
array is empty, even though the same file's `DataTable` usage does pass a proper
`empty="..."` prop elsewhere. This is an inconsistent application of the rule within a
single file: one widget on the page follows CLAUDE.md's empty-state guidance, the other
silently shows a bare zero.

### 4. Labs, Assessments, Vendors, Risk, Evidence — compliant by construction (none)
`apps/web/app/labs/[id]/page.tsx`, `apps/web/app/assessment/[id]/page.tsx`,
`apps/web/app/evidence/[id]/page.tsx`, `apps/web/app/risk/[id]/page.tsx`,
`apps/web/app/vendors/[id]/page.tsx` all source from `apps/web/app/lib/mvp-data.ts`
literal arrays via `array.find(...) ?? array[0]`. Because the backing arrays are
non-empty compile-time literals, these routes can never structurally render blank or
crash from absent data — there is always at least one demo record. This satisfies the
letter of the "demo data" clause but means the entire page is hard-coded into the bundle,
which is itself a data-integrity caveat (see `ROUTE_HEALTH_REPORT.md`).

### 5. Artifacts — subsystem does not exist as a route (Medium, explicit absence)
A `find apps/web/app -iname "*artifact*"` over the route tree returns no matches. There
is no `/artifacts` page, list, or detail route anywhere in `apps/web/app`. Artifact
content exists only as planning documents under `docs/artifacts/*.md` (template specs,
not seeded data or a UI). The empty-state rule cannot be evaluated for this surface
because the surface itself has not been built — this should be stated explicitly rather
than assumed to be "compliant by absence." If artifacts were promised in product
narrative (curriculum docs reference "artifact libraries"), this is a real gap, not a
zero-finding.

### 6. Portfolio, Career, Certifications — compliant via mvp-data, same caveat as #4
`apps/web/app/portfolio` (not separately enumerated above but present in the 87-route
list) and `apps/web/app/career`, `apps/web/app/certifications` follow the same static
mvp-data pattern confirmed for the dynamic-id routes. No crash risk, no blank-screen
risk, but also no live backend connection — the "zero empty state" guarantee currently
holds only because the screens are not yet wired to real, possibly-empty data sources.

## Severity Table

| Finding | Severity |
|---|---|
| Frameworks detail crash instead of empty/error UX | Critical (cross-ref) |
| Scenarios page has no AI-entry-point / CTA, only prose | Low |
| Learning stat card silent zero vs DataTable empty prop inconsistency | Medium |
| Artifacts route does not exist | Medium |
| Labs/Assessments/Vendors/Risk/Evidence/Portfolio/Career/Certifications hard-coded fixtures | Informational |

## Recommendation

Wrap the frameworks detail lookup in try/catch and render a proper empty/CTA state
instead of letting `error.tsx` fire for data-shape mismatches. Give the Scenarios page at
least one actionable CTA (e.g., "Generate a scenario" / "Import from template") rather
than prose-only. Make the Learning stat-card zero state consistent with the DataTable
`empty=` convention already used elsewhere in the same file. Decide whether Artifacts is
in scope for the current milestone; if so, scaffold the route even before backend wiring,
per the documentation-first methodology, so the zero-empty-states rule has something to
apply to.
