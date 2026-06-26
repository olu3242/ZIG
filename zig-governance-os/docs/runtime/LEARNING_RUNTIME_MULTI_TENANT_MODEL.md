# Learning Runtime Multi-Tenant Model

## Purpose
Validates that every runtime entity named across Waves 1-11 (learning_tracks, lessons,
labs, assessments, artifacts, certifications) is correctly scoped to `tenant_id`, per
CLAUDE.md's mandatory tenant-isolation rule. This is a validation pass, not new schema
work.

## Confirmed isolation mechanism
Every existing service extends `BaseService<T extends TenantScopedRecord>`
(`packages/services/src/BaseService.ts`), whose `create`/`update`/`delete`/`findById`/
`findMany`/`search` methods all take a `TenantContext` as their first argument and
delegate to a `TenantRepository<T>`. Isolation is enforced at the repository/data layer,
not in UI code — confirmed by reading `BaseService.ts` and `LearningService.ts` directly.

## Entity-by-entity scoping check

| Entity | Backed by | Scoping verdict |
|---|---|---|
| `learning_tracks` | `LearningPathRecord` via `LearningService` | **Scoped.** `TenantScopedRecord`, read through `TenantContext`. |
| `lessons` | `LearningModuleRecord` via `LearningService.findModules` | **Scoped.** Same repository pattern, filtered by `learningPathId` within the tenant context. |
| `labs` | `ScenarioRecord` via `ScenarioService` (state model gap noted in `LEARNING_RUNTIME_STATE_MODEL.md`) | **Scoped for scenario data.** Lab *attempt* state has no record shape yet — scoping of that future record is a constraint to carry into whatever resolves the gap, not yet verifiable. |
| `assessments` | **Gap** — no `AssessmentService` | **Not yet applicable.** Whichever service resolves this gap must extend `BaseService<TenantScopedRecord>` to inherit isolation automatically — flagged as a hard requirement for that decision, not optional. |
| `artifacts` | Generated from `RiskService`/`ControlService`/`AssetService`/`AuditService`/`EvidenceService` reads — all `BaseService` subclasses | **Scoped.** Artifacts are reads-then-render; they inherit isolation from the services they query. No separate artifact record exists today, so there's nothing additional to scope. |
| `certifications` | **Gap** — no persistence layer | **Not yet applicable.** Same requirement as assessments: any future certificate record must be `TenantScopedRecord`-based. |

## Roles
The 7 roles defined in CLAUDE.md (Organization Admin, GRC Manager, Risk Analyst,
Compliance Analyst, Auditor, Consultant, Viewer) are not learner-specific roles — Career
Mode's role list (GRC Analyst, Compliance Officer, Auditor, Risk Manager, CISO, per
`LEARNING_RUNTIME_CAREER_OS.md`) is a separate, learning-context concept and must not be
conflated with or substituted for the tenant RBAC roles. This distinction is called out
explicitly because the two role lists name overlapping job titles but serve different
purposes (system permissions vs. simulated career persona).

## Verdict
No entity reviewed here breaks tenant isolation. The two gaps (assessments,
certifications) are pre-existing, already-documented gaps from earlier waves, not new
isolation risks — they simply don't exist yet to evaluate.

## What this wave does NOT do
Does not create or modify any schema. Does not build the two gap-flagged services. Does
not change RBAC roles or permissions.
