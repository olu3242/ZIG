# Database Schema

## Purpose

Batch 21 establishes PostgreSQL and Supabase as the canonical persistence layer for Zig Governance OS. This schema is the source of truth for modules that persist governance work after the UI shell and identity foundation.

The migration lives at:

```text
supabase/migrations/202606180001_batch_21_core_data_platform.sql
```

## Core Tables

The migration creates:

- `tenants`
- `users`
- `roles`
- `permissions`
- `role_permissions`
- `projects`
- `frameworks`
- `controls`
- `control_mappings`
- `assets`
- `risks`
- `risk_assessments`
- `evidence`
- `tasks`
- `audits`
- `assessments`
- `learning_paths`
- `learning_modules`
- `scenarios`
- `scenario_runs`
- `governance_scores`
- `recommendations`
- `audit_events`

## Tenant Isolation

Every table carries a `tenant_id` column, including `tenants` where `tenant_id` mirrors `id` for a consistent tenant-scoped data access convention.

Row-level security is enabled for every table. Policies constrain access with:

```sql
tenant_id = current_tenant_id()
```

`current_tenant_id()` reads from:

```text
app.current_tenant_id
```

The application data access layer must set that value per request when using a PostgreSQL/Supabase adapter.

## Relationship Model

The schema preserves the documented Governance Graph spine:

```text
Tenant -> Project -> Asset -> Risk -> Control -> Framework -> Evidence -> Task
```

Additional relationships support convergence:

- `risk_assessments` link to `risks`
- `control_mappings` link controls across frameworks
- `audits` and `assessments` link to projects and frameworks
- `scenarios` and `scenario_runs` link to projects
- `governance_scores` and `recommendations` link to projects
- `audit_events` trace changes across all tables

## Audit Logging

`audit_events` records:

- `create`
- `update`
- `delete`
- `approve`
- `review`
- `certification`

Each event includes tenant, actor, entity table, entity id, before state, after state, reason, and timestamp.

## Operational Guarantees

- Every operational record is tenant-scoped.
- Every project-scoped record belongs to a project.
- Frameworks are metadata records, not standalone product modules.
- Evidence and tasks remain linked to controls and projects.
- Governance scores and recommendations are stored as explainable project-level outputs.

## Open Issues

- Supabase Auth user references are wired through `users.auth_user_id` in the frontend/backend integration phase.
- RLS reads `app.current_tenant_id` or the PostgREST `x-tenant-id` request header.
- Framework seed data and control catalogs arrive in later framework batches.
- Graph relationship tables are deferred to Batch 23.

## Frontend Integration Additions

The frontend/backend integration phase adds:

- `users.auth_user_id` for Supabase Auth linkage.
- `users.persona` for role-based experience loading.
- `project_frameworks` for explicit project-framework assignment traceability.
- `login` and `logout` audit actions.
