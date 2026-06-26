# Platform Health Score

Synthesis of the 13 preceding wave reports in `docs/forensics/`:
`FRAMEWORK_IDENTIFIER_AUDIT.md`, `SERVICE_CONTRACT_REPORT.md`, `SERVICE_DEPENDENCY_MAP.md`,
`NULL_SAFETY_REPORT.md`, `EMPTY_STATE_REPORT.md`, `SCENARIO_INTEGRITY_REPORT.md`,
`LEARNING_INTEGRITY_REPORT.md`, `ROUTE_HEALTH_REPORT.md`, `RUNTIME_ERROR_REPORT.md`,
`DATA_MODEL_DRIFT_REPORT.md`, `FRAMEWORK_ENGINE_HEALTH_REPORT.md`,
`VISUAL_ASSET_HEALTH_REPORT.md`, `TENANT_INTEGRITY_REPORT.md`, and `BUILD_HEALTH_REPORT.md`.

This audit was commissioned around a specific, real bug: the Framework Library detail
page (`/frameworks/[id]`) crashes for any framework whose id is a code-shaped string
(e.g. `"iso27001"`) rather than a uuid, because the page's own fallback/demo data
generator (`fallbackFrameworks()` in `apps/web/app/lib/data.ts`) produces exactly that
shape of id, and the lookup path (`FrameworkService.findById` ->
`SupabaseRestAdapter.findById`) has no try/catch around a PostgREST query that requires a
uuid. The audit's premise — that this is a symptom of broader ID/contract drift, not an
isolated bug — is confirmed by every wave below.

## Scorecard

| Dimension | Score (1-5, 5=healthy) | Basis |
|---|---|---|
| Architecture | 2 | `SERVICE_DEPENDENCY_MAP.md`/`SERVICE_CONTRACT_REPORT.md`: only 3 of dozens of service methods are ever called from `apps/web`; 12 services exist, most unused; ~100 packages exist, many are unwired stubs. |
| Data Integrity | 1 | `DATA_MODEL_DRIFT_REPORT.md`: `frameworks`, `projects`, `assets`, `controls` are each defined twice with incompatible PKs/FKs/tenancy roots (`tenants` vs `organizations`); `FRAMEWORK_IDENTIFIER_AUDIT.md` traces this directly to the production bug. |
| Runtime Safety | 2 | `NULL_SAFETY_REPORT.md`/`RUNTIME_ERROR_REPORT.md`/`ROUTE_HEALTH_REPORT.md`: only one route (`/frameworks/[id]`) can currently throw, but it does so unconditionally for non-uuid ids; error boundaries are 11 hand-duplicated copies that render raw `error.message` with an inert "Try again" for this specific failure; zero `not-found.tsx` files exist anywhere. |
| Learning Integrity | 2 | `LEARNING_INTEGRITY_REPORT.md`: 8 of 9 curriculum tracks (41 lessons, 8 labs, fully documented) have zero seeded rows; the curriculum map cites three services (`ComplianceStatusService`, `FrameworkMappingService`, `FrameworkRoadmapService`) that do not exist anywhere in source. |
| Scenario Integrity | 1 | `SCENARIO_INTEGRITY_REPORT.md`: five fully-documented simulated-company scenarios have zero seed rows in either of two candidate table families, and the live `/scenarios` page is entirely static with no service/repository call at all. |
| Framework Integrity | 1 | `FRAMEWORK_ENGINE_HEALTH_REPORT.md`: three independent, non-interoperating framework type systems exist (`packages/framework-engine`, `packages/frameworks`, plus two conflicting db schemas); `apps/web` and `apps/admin` render frameworks from different sources of truth; the Control Crosswalk UI is disconnected from all of them. |
| Multi-Tenant Integrity | 2 | `TENANT_INTEGRITY_REPORT.md`: RLS is genuinely enabled (not a template-only stub) and the `x-tenant-id` header is genuinely wired into `current_tenant_id()` via PostgREST header passthrough — but this entire mechanism only applies to the `tenants`-rooted schema; the parallel `organizations`-rooted schema (per `DATA_MODEL_DRIFT_REPORT.md`) has its own RLS policies that do not call the same function, and it is unknown which schema is live. |
| Build Stability | 4 | `BUILD_HEALTH_REPORT.md`: typecheck, full-workspace test run, `next build` (87 routes), and `eslint` all passed cleanly when re-run in this session. The one real gap is that `packages/data-access` and `packages/services` — the two packages most responsible for the frameworks bug — have zero executable tests (their `test` script aliases to `typecheck`). |
| **Overall Readiness** | **2 / 5** | Driven down by Data Integrity, Scenario Integrity, and Framework Integrity; held up only by Build Stability. |

## Five Most Severe Findings Across All Waves

1. **Two conflicting `frameworks` tables, one uuid-keyed and one text-PK-keyed, are both present in migration history** — `supabase/migrations/202606180001_batch_21_core_data_platform.sql:106` vs `supabase/migrations/202606200003_governance_lifecycle_create.sql:4`. This is the direct root cause of the production bug and is replicated for `projects`, `assets`, and `controls` (`DATA_MODEL_DRIFT_REPORT.md`).
2. **`apps/web/app/frameworks/[id]/page.tsx:9` calls `findById` with no try/catch**, the only unguarded data-fetch in the entire 87-route surface (`ROUTE_HEALTH_REPORT.md`, `NULL_SAFETY_REPORT.md`).
3. **`apps/web/app/lib/data.ts`'s `fallbackFrameworks()` manufactures a code-shaped `id` (`framework.code.toLowerCase()`)** that is structurally incompatible with the uuid column the real lookup expects (`FRAMEWORK_IDENTIFIER_AUDIT.md`).
4. **The `/scenarios` page and `ScenarioService` are completely disconnected from each other and from five fully-documented scenarios with zero seed rows** (`SCENARIO_INTEGRITY_REPORT.md`).
5. **Two parallel tenancy roots (`tenants` vs `organizations`) both have independently-enabled RLS policies for the same table names**, and it is unknown which is authoritative in any live environment (`TENANT_INTEGRITY_REPORT.md`, `DATA_MODEL_DRIFT_REPORT.md`).

## Verdict

The platform is **not production-ready** on the data-integrity and feature-completeness
axes, despite being mechanically buildable and lintable. The frameworks bug that
triggered this audit is one visible symptom of a repository-wide pattern: schema
definitions, service contracts, and framework/scenario/curriculum vocabularies have been
redefined in parallel rather than evolved in place, leaving multiple live-looking but
mutually incompatible versions of the same concept. No fixes were applied as part of this
audit; all findings above are read-only observations with file:line evidence, and
remediation is left to follow-up work.
