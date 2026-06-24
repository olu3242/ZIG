# Framework Engine Health Report

Scope: `packages/framework-engine/src/FrameworkRegistry.ts`, `packages/frameworks/src/index.ts`,
`apps/web/app/framework-mapper/page.tsx`, `apps/admin/app/frameworks/page.tsx`, and every
real source-level consumer of both packages (identified via grep, excluding `.next`
build-cache and `.tsbuildinfo` noise).

## Findings

### 1. There are three independent, non-interoperating "framework" type systems (Critical)
1) `packages/framework-engine/src/FrameworkRegistry.ts` (72 lines) defines
`FrameworkCode = "ISO27001" | "NIST_CSF" | "SOC2" | "HIPAA" | "PCI_DSS" | "CIS_CONTROLS"`
(upper-snake) and a static `FRAMEWORK_REGISTRY` of 6 entries with slug `id`s like
`"framework_iso27001_2022"`. 2) `packages/frameworks/src/index.ts` (68 lines) defines a
*different* `FrameworkCode = "iso27001_2022" | "nist_csf_2" | "nist_800_53_rev5" | "soc2"
| "hipaa" | "pci_dss" | "cis_controls_v8" | "gdpr" | "cmmc" | "custom"` (lower-snake, 10
entries, including frameworks absent from `framework-engine`'s 6), plus a
`FrameworkIntelligenceEngine` class and `FrameworkReadiness` interface
(`coverage`/`readiness`/`health`/`controlCoverage`/`evidenceCoverage`/`gapCount`) that
`framework-engine` has no equivalent of. 3) The database itself has two more
representations (`frameworks.id uuid` vs `frameworks.framework_id text`, per
`DATA_MODEL_DRIFT_REPORT.md`). None of these four representations share an id format,
a code casing convention, or even an agreed total framework count (6 vs 10 vs whatever
is actually seeded).

### 2. The two `packages/*` framework systems are used by two different apps, not unified (High)
`apps/web/app/lib/data.ts` and `apps/web/app/lib/actions.ts` import from
`packages/framework-engine` (`FrameworkRegistry`) — confirmed by grep, with hits
appearing in real source files, not just build cache. `apps/admin/app/frameworks/page.tsx`
imports `FrameworkIntelligenceEngine` from `@zig/frameworks` (`packages/frameworks`)
instead. This means the web app and the admin app each render "the list of frameworks"
from a separate, independently-maintained source of truth, with different framework
codes and different counts. A framework added to one will not appear in the other.

### 3. `packages/frameworks`' readiness/coverage model is richer but not wired to real data (Medium)
`FrameworkReadiness` (in `packages/frameworks/src/index.ts`) models exactly the kind of
compliance-readiness scoring a "framework engine" should provide — `coverage`,
`readiness`, `health`, `controlCoverage`, `evidenceCoverage`, `gapCount`. This audit did
not find a corresponding repository, service, or seeded data source that populates these
fields with real numbers; the type exists, but no implementation reading real
risk/control/evidence rows into it was found in `packages/frameworks/src/index.ts`'s 68
lines (the file was read in full and contains only types, a static `frameworkRegistry`
array, and the `FrameworkIntelligenceEngine` class declaration — its method bodies were
not separately re-verified against live data sources in this pass, but no service-layer
caller supplying real coverage numbers was found via grep).

### 4. The "Control Crosswalk" UI is backed by neither framework-engine nor packages/frameworks (High, cross-ref)
`apps/web/app/framework-mapper/page.tsx` — the only UI in the app that visually
represents cross-framework control mapping — imports `frameworkMappings` from
`apps/web/app/lib/mvp-data`, a static literal array, not from either framework package.
Its `StatCard`s show hard-coded values (`"Frameworks: 3"`, `"Coverage: Mapped"`). This
means the one feature most associated with "framework engine" capability in the product
narrative is, in the running app, fully disconnected from both framework type systems
and both database schemas — it is pure presentation over fixture data.

### 5. `agent-domain-intelligence` and `agent-execution` packages depend on `packages/frameworks`, deepening the split (Medium)
`packages/agent-execution/src/readiness-scoring.ts` and
`packages/agent-domain-intelligence/src/framework-mapping.ts` both import from
`packages/frameworks` (confirmed via grep). This means the agent-automation surface of
the platform has standardized on the 10-framework, lower-snake-case system, while the
core web product (`apps/web`) has standardized on the 6-framework, upper-snake-case
system. Any future integration between agents and the web UI around frameworks will need
to reconcile these two vocabularies first.

## Severity Table

| Finding | Severity |
|---|---|
| Three non-interoperating framework type systems (2 packages + db) | Critical |
| apps/web and apps/admin render frameworks from different sources of truth | High |
| Control Crosswalk UI disconnected from both framework packages | High |
| Agent packages standardized on a third vocabulary, deepening split | Medium |
| Readiness/coverage model exists as types only, no confirmed live data path | Medium |

## Recommendation

Pick one framework code vocabulary (likely the database's `code` column values, since
that is the actual persistence layer) and migrate both `packages/framework-engine` and
`packages/frameworks` to consume it rather than hand-maintaining separate enums. Decide
whether `packages/framework-engine` (used by `apps/web`) or `packages/frameworks` (used
by `apps/admin` and the agent packages) is the long-term home for framework logic, and
deprecate the other rather than maintaining both in parallel. Wire
`apps/web/app/framework-mapper/page.tsx` to whichever survives, replacing the
`mvp-data.ts` literal `frameworkMappings` with real data once a coverage/crosswalk
computation exists behind one of the two engines.
