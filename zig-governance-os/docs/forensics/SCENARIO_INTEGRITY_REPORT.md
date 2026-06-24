# Scenario Integrity Report

Scope: `docs/scenarios/*.md` (CLOUDPAY, GOVSEC, HEALTHBRIDGE, MANUFACTURX, RETAILNOVA),
`apps/web/app/scenarios/page.tsx`, `packages/services/src/ScenarioService.ts`,
`supabase/migrations/202606180001_batch_21_core_data_platform.sql` (`scenarios`,
`scenario_runs` tables), and `supabase/migrations/202606180007_learning_os_e2e.sql`
(`simulated_companies`, `simulated_company_objects`).

## Findings

### 1. Five fully-documented scenarios, zero seeded rows (High)
`docs/scenarios/CLOUDPAY.md`, `GOVSEC.md`, `HEALTHBRIDGE.md`, `MANUFACTURX.md`, and
`RETAILNOVA.md` (33-36 lines each) are complete narrative specs for simulated companies
used in scenario-based learning/assessment. `CLOUDPAY.md` states explicitly: "Seeding
these rows is a follow-up to this doc, not included here (doc-first per CLAUDE.md)." This
is an honest admission in the docs themselves, not a hidden gap — but it means none of
the five scenarios exist as queryable data anywhere in `supabase/seed/`. A
`find supabase/seed -type f` shows only `001_demo_foundation.sql`, `mvp_seed.sql`, and
`002_learning_content_wave_1.sql` — none reference CloudPay, GovSec, HealthBridge,
ManufacturX, or RetailNova by name.

### 2. Two table families exist for scenario data, neither populated for these 5 (High)
`supabase/migrations/202606180001_batch_21_core_data_platform.sql` defines `scenarios`
and `scenario_runs` (uuid-keyed, tenant-scoped) at lines 261-284. Separately,
`supabase/migrations/202606180007_learning_os_e2e.sql` defines `simulated_companies` and
`simulated_company_objects` (confirmed via grep match, not yet cross-read against the
batch_21 `scenarios` table). These are two structurally different concepts — generic
"scenario" planning records vs. "simulated company" objects for the five named personas
— and neither is populated with the CloudPay/GovSec/HealthBridge/ManufacturX/RetailNova
content the docs describe. There is no migration or seed file that bridges the
documented scenario names to either table family.

### 3. The live `/scenarios` UI is fully disconnected from both table families (Critical)
`apps/web/app/scenarios/page.tsx` is a 21-line static component with zero imports of any
service, repository, or data file. It does not call `ScenarioService`, does not query
`scenarios`/`scenario_runs`, and does not reference `simulated_companies`. Every value on
the page (`"0"`, `"N/A"`, "No scenario runs exist for this tenant yet.") is a literal
string. This means the entire scenario subsystem — five fully-specified personas, two
database table families, and a `ScenarioService` class — has no live path to the rendered
UI at all. A user visiting `/scenarios` today cannot reach any of this work in any state,
seeded or not.

### 4. ScenarioService is a 15-line pass-through with no scenario-specific logic (Medium)
`packages/services/src/ScenarioService.ts` (15 lines, confirmed in wave-2 read) extends
`BaseService<ScenarioRecord>` with no overrides. It provides generic CRUD only; there is
no method for "run a scenario," "score a scenario," or "instantiate a simulated company,"
despite the narrative complexity of the five `docs/scenarios/*.md` files (each describing
multi-stage simulated incidents, decisions, and scoring). The gap between the documented
scenario *behavior* and the implemented scenario *service surface* is total — none of the
behavior described in the docs has a corresponding method anywhere in
`packages/services/src`.

### 5. No grep hits for scenario names anywhere in apps/web or packages (Medium)
A search for "CloudPay", "GovSec", "HealthBridge", "ManufacturX", "RetailNova" (the five
documented scenario identifiers) across `apps/web` and `packages/*` source returns no
matches outside the `docs/scenarios/*.md` files themselves. The scenarios exist purely as
prose; there is no constant, fixture, or even a TODO comment in code referencing them.

## Severity Table

| Finding | Severity |
|---|---|
| `/scenarios` route fully disconnected from service/table layer | Critical |
| Two undifferentiated scenario table families, neither populated | High |
| Five documented scenarios with zero seed rows | High |
| ScenarioService has no scenario-specific behavior | Medium |
| Scenario names absent from all code (docs-only) | Medium |

## Recommendation

Before adding more scenario narrative docs, pick one of the two table families
(`scenarios`/`scenario_runs` vs. `simulated_companies`/`simulated_company_objects`) as
canonical and document the decision. Write a seed migration that materializes at least
one of the five documented scenarios (CloudPay is the simplest per its doc) into that
canonical table so the `/scenarios` page has something real to query. Wire
`apps/web/app/scenarios/page.tsx` to `ScenarioService` (or a new scenario-specific
service) instead of leaving it fully static, even if the first wiring only surfaces
seeded rows from #the chosen table. Expand `ScenarioService` with at least a
`listForTenant` method that the page can call, replacing the literal `"No scenario runs
exist"` string with a real, empty-but-honest result.
