# Data Access Layer

## Purpose

The Batch 21 data access layer provides tenant-enforced repositories for every canonical Zig table. Future modules must use this layer instead of querying persistence directly.

Package:

```text
packages/data-access
```

## Repository Contract

Each repository supports:

- `create()`
- `update()`
- `delete()`
- `findById()`
- `findMany()`
- `search()`
- `approve()`
- `review()`

Every method receives a `TenantContext`:

```typescript
interface TenantContext {
  tenantId: string
  actorUserId?: string
}
```

Repositories inject `tenantId` on create and constrain all reads, updates, deletes, search, approve, and review operations to the active tenant.

## Adapter Boundary

The repository is backed by a `DatabaseAdapter<T>` interface. Batch 21 includes an `InMemoryDatabaseAdapter` for deterministic testing and development without introducing Supabase client wiring before Batch 22.

The Supabase/PostgreSQL adapter must preserve the same contract:

- set `app.current_tenant_id`
- query only tenant-scoped rows
- return typed records
- preserve audit logging

## Audit Layer

Repositories can receive an `AuditSink`. Batch 21 includes `AuditRepository`, which records tenant-scoped audit events for:

- create
- update
- delete
- approve
- review

Certification events are supported in the data model and reserved for later certification workflows.

## Repository Registry

`createInMemoryRepositories()` returns repositories for:

- tenants
- users
- roles
- projects
- frameworks
- controls
- control mappings
- assets
- risks
- risk assessments
- evidence
- tasks
- audits
- assessments
- learning paths
- learning modules
- scenarios
- scenario runs
- governance scores
- recommendations
- audit events

## Tests

Compile-time smoke tests live in:

```text
packages/data-access/src/tests/tenant-isolation.test.ts
```

The test asserts:

- tenant A cannot read tenant B records
- `findById()` enforces tenant context
- create operations emit tenant-scoped audit events

## Open Issues

- Add a real Supabase adapter after Batch 22 identity/session handling exists.
- Add runtime test runner configuration when the repo standardizes on a test framework.
- Add repository pagination metadata when list views need total counts.
