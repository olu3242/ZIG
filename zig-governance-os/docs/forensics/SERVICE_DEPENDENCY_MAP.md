# Service Dependency Map

Scope: `packages/services/src/factory.ts` (the wiring root), each service's constructor
dependencies, and which `apps/web` code paths actually reach into this layer.

## Dependency tree (from `factory.ts:176-191`)

```
ZigServices (createServices)
|-- tenants:     TenantService(tenants repo, users repo)
|-- users:       UserService(users repo)
|-- audit:       AuditService(auditEvents sink)            <- not a TenantRepository
|-- frameworks:  FrameworkService(frameworks repo)
|-- projects:    ProjectService(projects repo, projectFrameworks repo?)
|-- assets:      AssetService(assets repo)
|-- risks:       RiskService(risks repo, riskAssessments repo)
|-- controls:    ControlService(controls repo, controlMappings repo)
|-- evidence:    EvidenceService(evidence repo)
|-- learning:    LearningService(learningPaths repo, learningModules repo)
|-- scenarios:   ScenarioService(scenarios repo, scenarioRuns repo)
+-- governance:  GovernanceService(governanceScores repo, recommendations repo)
```

Every repo above is a `TenantRepository<T>` (`packages/data-access/src/TenantRepository.ts`)
wrapping either a `SupabaseRestAdapter<T>` (production,
`createSupabaseRepositories`, `repositories.ts:54-81`) or an `InMemoryDatabaseAdapter<T>`
(tests, `createInMemoryRepositories`, `repositories.ts:83-110`). No service depends on
another service directly -- all cross-entity logic (e.g. "find mappings for this control")
is implemented by injecting a second repository into the constructor, not by composing
services. This is a clean layering choice in isolation, but it also means there is no
service-level place to enforce, e.g., "a control's `frameworkId` must reference a real row
in `frameworks`" -- such checks would have to live in the database (FK constraints) or be
added explicitly to each service method, and none of the inspected service methods do this
(see `SERVICE_CONTRACT_REPORT.md` item 4 for the `ProjectService.createGovernanceProject`
consequence).

## Repository -> table mapping (from `repositories.ts:57-79`)

| Repository key | Table name | Adapter |
|---|---|---|
| `tenants` | `tenants` | `SupabaseRestAdapter<TenantRecord>` |
| `users` | `users` | `SupabaseRestAdapter<UserRecord>` |
| `roles` | `roles` | `SupabaseRestAdapter<RoleRecord>` |
| `projects` | `projects` | `SupabaseRestAdapter<ProjectRecord>` |
| `projectFrameworks` | `project_frameworks` | `SupabaseRestAdapter<ProjectFrameworkRecord>` |
| `frameworks` | `frameworks` | `SupabaseRestAdapter<FrameworkRecord>` (uuid-keyed table per `FRAMEWORK_IDENTIFIER_AUDIT.md`) |
| `controls` | `controls` | `SupabaseRestAdapter<ControlRecord>` |
| `controlMappings` | `control_mappings` | `SupabaseRestAdapter<ControlMappingRecord>` |
| `assets` | `assets` | `SupabaseRestAdapter<AssetRecord>` |
| `risks` | `risks` | `SupabaseRestAdapter<RiskRecord>` |
| `riskAssessments` | `risk_assessments` | `SupabaseRestAdapter<RiskAssessmentRecord>` |
| `evidence` | `evidence` | `SupabaseRestAdapter<EvidenceRecord>` |
| `tasks` | `tasks` | `SupabaseRestAdapter<TaskRecord>` (no `TaskService` exists -- see gap below) |
| `audits` | `audits` | `SupabaseRestAdapter<AuditRecord>` (no `AuditRecordService` exists -- distinct from `AuditService`/`auditEvents`) |
| `assessments` | `assessments` | `SupabaseRestAdapter<AssessmentRecord>` (no `AssessmentService` exists) |
| `learningPaths` | `learning_paths` | `SupabaseRestAdapter<LearningPathRecord>` |
| `learningModules` | `learning_modules` | `SupabaseRestAdapter<LearningModuleRecord>` |
| `scenarios` | `scenarios` | `SupabaseRestAdapter<ScenarioRecord>` |
| `scenarioRuns` | `scenario_runs` | `SupabaseRestAdapter<ScenarioRunRecord>` |
| `governanceScores` | `governance_scores` | `SupabaseRestAdapter<GovernanceScoreRecord>` |
| `recommendations` | `recommendations` | `SupabaseRestAdapter<RecommendationRecord>` |

## Gap: three repositories exist with no corresponding service

`ZigRepositories` (`repositories.ts:29-52`) defines `tasks`, `audits`, and `assessments` as
first-class repositories, but `ZigServices` (`factory.ts:161-174`) has no `TaskService`,
no service wrapping the `audits` table (the existing `AuditService` wraps the separate
`auditEvents`/`audit_events` sink, a different table entirely), and no `AssessmentService`.
These three repositories are constructed in `createSupabaseRepositories` /
`createInMemoryRepositories` but never passed to any service constructor in
`createServices` -- they are unreachable dead wiring. This matters because `apps/web`'s
real assessment UI (`apps/web/app/assessment/[id]/page.tsx`) is built entirely on the
`mvp-data.ts` static `assessments` fixture, not the `assessments` table/repository -- so
even if an `AssessmentService` existed, nothing currently calls it. Same applies to tasks
(`apps/web/app/app` has no `/tasks` route at all -- see `ROUTE_HEALTH_REPORT.md`).

## apps/web -> packages/services call graph (full enumeration)

```
apps/web/app/lib/actions.ts:346   -> services.audit.recordAction(...)
apps/web/app/lib/auth.ts:96       -> services.audit.recordAction(...)
apps/web/app/lib/data.ts:13       -> services.frameworks.findAvailableFrameworks(...)  (via safeLoad fallback)
apps/web/app/frameworks/[id]/page.tsx:9 -> services.frameworks.findById(...)
```

That is the **entire** set of production call sites into `packages/services` discovered by
`grep -rn "getZigServices()\." apps/web/app`. Every other route (`Risks`, `Controls`,
`Assets`, `Evidence`, `Learning`, `Labs`, `Scenarios`, `Vendors`, `Assessments`,
`Portfolio`, `Career`, `Certifications`) is implemented against `apps/web/app/lib/mvp-data.ts`
(static, in-memory, hardcoded fixtures) or `apps/web/app/lib/lifecycle.ts` (a separate,
hand-rolled REST client against the `public.frameworks` / `public.projects` /
`public.assets` / `public.controls` / `public.activities` tables created by
`202606200003_governance_lifecycle_create.sql`). These are two more independent data
pathways layered on top of `packages/services` + `packages/data-access`, none of which
share code with each other.

## Three parallel "data access" implementations, diagrammed

```
apps/web routes
  |
  |-- Frameworks detail/list  --> packages/services (FrameworkService) --> packages/data-access (SupabaseRestAdapter) --> frameworks (uuid PK table)
  |-- Dashboard/Projects list --> apps/web/app/lib/lifecycle.ts (hand-rolled REST) --> public.frameworks / public.projects / public.assets / public.controls (text/uuid mixed PK table)
  +-- Risks/Controls/Assets/Evidence/Learning/Labs/Scenarios/Vendors/Assessments/Portfolio/Career/Certifications
                               --> apps/web/app/lib/mvp-data.ts (static in-process arrays, no database at all)
```

This three-way split is the structural root of the "ID/contract drift" pattern the audit
was commissioned to find: there is no single source of truth for what a framework, project,
asset, or control "is" -- three independently-evolved code paths each have their own
opinion, and only the first ("Frameworks detail/list") currently crashes, because it is the
only one whose two halves (`lifecycle.ts`-style listing producing text codes, `services`-style
detail page expecting uuids) actually try to talk to each other across the seam.

## Severity summary

| Finding | Severity |
|---|---|
| Three independent, non-interoperating data-access implementations for the same domain | Critical |
| `tasks`, `audits`, `assessments` repositories wired with no owning service | Medium |
| No service composes another service -- cross-entity integrity is unchecked at the service layer | Medium |

## Recommended remediation

1. Consolidate on one data-access path per entity. If `mvp-data.ts` is intentionally the
   MVP/demo data source, document that explicitly and stop building out
   `packages/services`/`packages/data-access` coverage for entities the UI does not yet
   consume, to avoid further contract drift accumulating in code nobody is exercising.
2. Either add `TaskService`/`AssessmentService` (and decide what `audits` vs `audit_events`
   are for) or remove the unused repositories from `ZigRepositories` to reduce surface area.
3. When/if `lifecycle.ts` and `packages/services` are meant to converge, do it by retiring
   one of the two `frameworks`/`projects` schemas first (see `DATA_MODEL_DRIFT_REPORT.md`).
