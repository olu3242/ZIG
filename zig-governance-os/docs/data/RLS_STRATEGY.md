# RLS Strategy

## Purpose

Row Level Security is the database-enforced tenant isolation layer for Zig. UI checks and service-layer filters are not sufficient by themselves.

## Tenant Context

The database reads tenant context from:

```sql
current_setting('app.current_tenant_id', true)
```

The helper function is:

```sql
current_tenant_id()
```

Application database adapters must set this value per request or transaction before running tenant-scoped queries.

## Policy Pattern

Every tenant-scoped table follows:

```sql
using (tenant_id = current_tenant_id())
with check (tenant_id = current_tenant_id())
```

The `tenants` table is self-scoped:

```sql
using (id = current_tenant_id())
with check (id = current_tenant_id())
```

## Tables Covered

RLS is enabled for:

- `tenants`
- `permissions`
- `roles`
- `role_permissions`
- `users`
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

## Views

Views use `security_invoker = true` so underlying RLS policies still apply.

Batch 21A views:

- `project_governance_summary`
- `tenant_audit_activity`

## Application Responsibilities

Application code must:

- Always carry tenant context.
- Use repository/service layers for data access.
- Never use service-role credentials for user-facing reads or writes.
- Fail closed when tenant context is missing.
- Include negative cross-tenant tests.

## Validation

Validation requirements:

- Migration applies successfully.
- Tenant A cannot read Tenant B records.
- Insert/update checks reject mismatched tenant IDs.
- Views return only active tenant data.

Full Supabase RLS validation is completed when a linked Supabase environment is available.

For PostgREST requests, `current_tenant_id()` also reads the `x-tenant-id` request header so service and repository calls can carry tenant context per request.

## Project Framework Assignments

`project_frameworks` uses the same tenant policy:

```sql
using (tenant_id = current_tenant_id())
with check (tenant_id = current_tenant_id())
```

Framework assignment records therefore cannot cross tenant boundaries even when project and framework ids are known.
