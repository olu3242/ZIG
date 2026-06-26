# Service Contract Report

Scope: every `*Service` class in `packages/services/src` (12 classes), their `BaseService`
contract, the repository/table they wrap, and every caller in `apps/web`.

## Inventory of services and override status

| Service | File:lines | Overrides BaseService methods? | Adds new methods | Repositories used |
|---|---|---|---|---|
| `TenantService` | `TenantService.ts:10-37` | No overrides; adds `createOrganization`, `findProfileTenant`, `countUsers` | 3 | `tenants`, `users` |
| `UserService` | `UserService.ts:116-138` | No overrides; adds `createProfile`, `findByEmail` | 2 | `users` |
| `AuditService` | `AuditService.ts:33-45` | Does **not extend `BaseService`** at all -- standalone class wrapping `AuditSink` | 1 (`recordAction`) | `auditEvents` (a `SupabaseAuditSink`, not a `TenantRepository`) |
| `FrameworkService` | `FrameworkService.ts:4-8` | No overrides; adds `findAvailableFrameworks` | 1 | `frameworks` |
| `ProjectService` | `ProjectService.ts:64-92` | No overrides; adds `createGovernanceProject` | 1 | `projects`, optional `projectFrameworks` |
| `AssetService` | `AssetService.ts` (4 lines) | **Empty subclass** -- zero overrides, zero additions | 0 | `assets` |
| `RiskService` | `RiskService.ts:65-76` | No overrides; adds `findAssessments` | 1 | `risks`, `riskAssessments` |
| `ControlService` | `ControlService.ts:19-30` | No overrides; adds `findMappings` | 1 | `controls`, `controlMappings` |
| `EvidenceService` | `EvidenceService.ts:80-83` | No overrides; adds `findByControl` | 1 | `evidence` |
| `LearningService` | `LearningService.ts:50-60` | No overrides; adds `findModules` | 1 | `learningPaths`, `learningModules` |
| `ScenarioService` | `ScenarioService.ts:4-15` | No overrides; adds `findRuns` | 1 | `scenarios`, `scenarioRuns` |
| `GovernanceService` | `GovernanceService.ts:92-103` | No overrides; adds `findRecommendations` | 1 | `governanceScores`, `recommendations` |

`BaseService` (`BaseService.ts:3-28`) provides `create`, `update`, `delete`, `findById`,
`findMany`, `search` -- all are thin delegations to the injected `TenantRepository`. None of
the 11 services that extend it override any of these six methods; all behavior differences
come purely from the constructor-injected secondary repository and the bespoke finder
method each subclass adds.

## Contract mismatches and broken assumptions

### 1. `AssetService` is a no-op subclass (Low/Medium)
`packages/services/src/AssetService.ts` is 4 lines: `export class AssetService extends
BaseService<AssetRecord> {}`. It adds nothing CRUD-wise beyond what `BaseService` already
provides, yet `assets` is one of the 11 "Universal Governance Model" entities called out by
name in `CLAUDE.md`. There is no `findByProject` or similar despite `AssetRecord` having a
clear FK relationship to `projects` in the schema (`assets.project_id` in
`202606180001_batch_21_core_data_platform.sql`). Any asset listing scoped to a project must
currently be done client-side by filtering `findMany(context)` results, which does not
scale and bypasses any server-side filtering PostgREST could do.

### 2. `AuditService` breaks the `BaseService<T>` contract entirely (Medium)
Every other service in the file extends `BaseService<SomeRecord>`. `AuditService` does not
-- it wraps `AuditSink` directly (`AuditService.ts:33`). This is architecturally
defensible (audit events are append-only, not a CRUD resource), but it means
`ZigServices.audit` (`factory.ts:164`) has a completely different shape from its 11
siblings, and any code that assumes all `ZigServices` members support `findById` /
`findMany` (e.g. a generic admin table renderer) will break silently on `audit`.

### 3. Almost all service methods are dead code from the app's perspective (Critical, cross-referenced in `SERVICE_DEPENDENCY_MAP.md`)
A repo-wide grep for `getZigServices().` in `apps/web` (`grep -rn "getZigServices()\."
apps/web/app`) returns exactly three call sites:
- `apps/web/app/lib/actions.ts:346` -- `audit.recordAction(...)`
- `apps/web/app/lib/auth.ts:96` -- `audit.recordAction(...)`
- `apps/web/app/frameworks/[id]/page.tsx:9` -- `frameworks.findById(...)`

`findAvailableFrameworks` is called once more, indirectly, inside `apps/web/app/lib/data.ts:13`
as a `safeLoad` fallback source for the dashboard. Every other method on every other
service -- `ProjectService.createGovernanceProject`, `RiskService.findAssessments`,
`ControlService.findMappings`, `EvidenceService.findByControl`,
`LearningService.findModules`, `ScenarioService.findRuns`,
`GovernanceService.findRecommendations`, `TenantService.createOrganization`,
`UserService.createProfile` -- is never invoked anywhere in `apps/web`. The actual UI for
Risks, Controls, Evidence, Learning, Scenarios, Vendors, Assessments, and Labs is built
entirely on the static fixtures in `apps/web/app/lib/mvp-data.ts` and the hand-rolled REST
helpers in `apps/web/app/lib/lifecycle.ts`, not on `packages/services`. This means the
`packages/services` layer (and by extension `packages/data-access`'s typed repository
wiring) is effectively an unused, untested-in-production parallel implementation of the
same domain that the UI actually exercises through a different path. Any contract drift
inside `packages/services` is invisible to manual testing of the app today, which is how
the `frameworks.findById` bug shipped without being caught -- it is the *one* service
method that the UI does call.

### 4. `ProjectService.createGovernanceProject` assumes a `frameworkId` shape that does not match the real `projects` table FK target (High)
`ProjectService.ts:7,23,77` requires `input.frameworkId: string` and passes it straight to
`this.repository.create(...)` as `frameworkId: requireName(input.frameworkId)`. The
`projects` table (`202606180001_batch_21_core_data_platform.sql:97-103` area, see
`projects_framework_id_fkey` constraint) has `framework_id uuid` with an FK to
`frameworks(id)` (the uuid-keyed table). If `createGovernanceProject` is ever called with a
`frameworkId` of the CODE/SLUG shape documented in `FRAMEWORK_IDENTIFIER_AUDIT.md` (which is
the only shape available anywhere else in the codebase today), the insert will fail the
same way `frameworks/[id]` does -- a PostgREST 400 for invalid uuid input. This method is
currently unreachable from `apps/web` (see #3), which is the only reason this latent bug has
not yet surfaced.

### 5. `ControlService.findMappings` and `RiskService.findAssessments` filter on fields whose snake_case/camelCase mapping has not been verified against the live schema (Medium)
`findMappings(context, sourceControlId)` filters `controlMappings` by `{ sourceControlId }`
(`ControlService.ts:27-28`). The real `control_mappings` table
(`202606180001_batch_21_core_data_platform.sql`, columns visible at lines ~139-150) needs
to be checked for a `source_control_id` column; `SupabaseRestAdapter.withFilters`
auto-converts `sourceControlId` -> `source_control_id` (`toSnakeKey`,
`SupabaseRestAdapter.ts:156-158`), so as long as the column is named exactly that, the
conversion is correct. This is a fragile implicit contract: any column naming
inconsistency between `ControlMappingRecord`'s TypeScript field names and the actual SQL
column names would silently produce empty result sets (PostgREST returns 200 with `[]` for
an unmatched filter key, not an error), which is a much harder failure mode to detect than
the `frameworks` UUID 400. No test in `packages/services/src/tests/` exercises
`findMappings` or `findAssessments` against a real schema (see `service-layer.test.ts` --
it uses `createInMemoryRepositories()`, which never validates real Postgres column names).

## Severity summary

| Finding | Severity |
|---|---|
| Entire `packages/services` layer is mostly dead code, masking contract drift | Critical |
| `ProjectService.createGovernanceProject` latent UUID/CODE FK mismatch | High |
| `AssetService` no-op subclass missing project-scoped finder | Medium |
| `AuditService` breaks the uniform `BaseService<T>` shape | Medium |
| Untested snake_case/camelCase filter mapping in `findMappings`/`findAssessments` | Medium |

## Recommended remediation

1. Add an integration test suite that runs `packages/services` against the real Supabase
   schema (or a local Postgres with the migrations applied), not just
   `createInMemoryRepositories()`, so contract drift between TypeScript field names and SQL
   column names is caught before merge.
2. Either wire `apps/web` to actually call `packages/services` for Risks/Controls/Evidence/
   Learning/Scenarios, or formally deprecate the package and document `mvp-data.ts` +
   `lifecycle.ts` as the production data path, so the next contributor does not assume
   `packages/services` is live and load-bearing.
3. Add a `findByProject` (or similar) method to `AssetService` to match the FK relationship
   actually present in the schema.
4. Decide and document whether `AuditService` should conform to `BaseService<AuditEvent>`
   or remain a special case, and annotate the divergence in code comments.
5. Fix `ProjectService.createGovernanceProject` to accept/require a framework identifier of
   the same canonical shape recommended in `FRAMEWORK_IDENTIFIER_AUDIT.md` before this
   method is ever wired up to a caller.
