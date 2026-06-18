# Testing Strategy

## Purpose

Testing in Zig scales with risk. Tenant isolation, data integrity, RBAC, scoring, graph traceability, and AI approval flows receive the strongest validation.

## Test Layers

| Layer | Scope |
|---|---|
| Typecheck | Package and app TypeScript contracts |
| Unit | Pure functions, engines, mappers, scoring, RBAC |
| Integration | Repositories, services, migrations, tenant-scoped workflows |
| E2E | Critical user journeys through the app |
| Security | RLS, RBAC, tenant isolation, audit logging |
| Accessibility | Primary user flows and dashboards |

## Current Commands

- Docs: `npm run docs:lint`
- Web build: `npm run build --workspace web`
- Web lint: `npm run lint --workspace web`
- Data access typecheck: `npm run typecheck --workspace @zig/data-access`
- Services typecheck: `npm run typecheck --workspace @zig/services`

## Required Tests By Batch Type

### Documentation Batch

- Run docs lint.
- Ensure docs are not stubs.

### Package Batch

- Add package typecheck script.
- Add compile-time or runtime tests for critical behavior.
- Run package typecheck.

### Database Batch

- Validate migration syntax.
- Validate RLS strategy.
- Add tenant isolation tests where adapter exists.

### App Route Batch

- Add loading and error states.
- Run web build and lint.
- Verify critical route returns 200 when dev server is available.

### Security-Sensitive Batch

- Add negative tests.
- Verify denied access paths.
- Confirm audit event generation.

## Test Data

Test data must include:

- At least two tenants
- At least two users with different roles
- Cross-tenant negative cases
- Project-scoped records
- Graph-linked records once Batch 23 exists

## Future Test Tooling

The repo still needs a standardized runtime test runner. Candidate requirement:

- TypeScript-native
- Works across workspaces
- Supports Node package tests
- Supports app integration tests
- Can run in CI

Do not add broad test framework churn inside unrelated feature batches.
