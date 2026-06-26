# Tenant Integrity Report

Scope: `supabase/policies/tenant-isolation.sql`, `current_tenant_id()` across its two
definitions (`202606180001_batch_21_core_data_platform.sql` and
`202606180003_frontend_backend_integration.sql`), `supabase/functions/current_tenant_id.sql`,
RLS-enabling statements across all 17 migrations, `packages/data-access/src/SupabaseRestAdapter.ts`'s
tenant-scoping logic, and `apps/web/app/lib/auth.ts`'s tenant-cookie handling.

## Findings

### 1. `tenant-isolation.sql` is explicitly self-documented as a non-authoritative pattern (Low, corrected from earlier assumption)
`supabase/policies/tenant-isolation.sql` (13 lines) opens with the comment "Tenant
isolation policy pattern. The active migration applies concrete policies table-by-
table." This file is honestly labeled as a reference pattern, not a misleading
placeholder — the real, enabled RLS policies live in the migrations. A grep for
`enable row level security` across `supabase/migrations/*.sql` finds it in 16 of 17
files, including 23 occurrences in `202606180001_batch_21_core_data_platform.sql` alone
and concrete `create policy tenant_<table>_access on <table> using (tenant_id =
current_tenant_id())` statements for `tenants`, `permissions`, `roles`,
`role_permissions`, `users`, `projects`, `frameworks`, and more (confirmed lines
399-407+). RLS is genuinely enabled, not just templated — this report corrects an
earlier provisional read of this area.

### 2. `current_tenant_id()` is redefined twice, and the second definition is the one that actually connects to the app (Medium)
`202606180001_batch_21_core_data_platform.sql:22-28` defines `current_tenant_id()` as
reading only the Postgres session GUC `app.current_tenant_id`. `202606180003
_frontend_backend_integration.sql:3-12` (a later migration) replaces it via `create or
replace function` with a version that *also* falls back to
`current_setting('request.headers', true)::jsonb ->> 'x-tenant-id'` — i.e. PostgREST's
per-request header passthrough. This second definition is what actually makes
`packages/data-access/src/SupabaseRestAdapter.ts`'s `x-tenant-id` header (set at line 87
of every request) meaningful to RLS. A third copy exists at
`supabase/functions/current_tenant_id.sql`, presumably the canonical/exported version of
the same function — this audit did not diff all three byte-for-byte, but their presence
in three separate files (two migrations plus one standalone function file) for a
single-purpose tenant-scoping function is itself a sign of the same "redefine instead of
update in place" pattern documented for `frameworks`/`projects`/`assets`/`controls` in
`DATA_MODEL_DRIFT_REPORT.md`.

### 3. The `x-tenant-id` header value is cast directly to `uuid` with no validation upstream (Medium)
`current_tenant_id()`'s second definition casts the header value with
`::uuid` and only guards against the empty string via `nullif(..., '')`. If
`context.tenantId` (set from the `zig_tenant_id` cookie in `apps/web/app/lib/auth.ts`,
lines 27-30) is ever a non-uuid string, this cast will throw a Postgres error inside the
RLS function itself, surfacing through PostgREST as an opaque 500/400 — structurally the
same failure shape as the frameworks bug (`FRAMEWORK_IDENTIFIER_AUDIT.md`), but at the
tenant-scoping layer instead of the entity-id layer. This audit found no validation in
`setTenantProfile()` (`apps/web/app/lib/auth.ts:27`) constraining `tenantId` to a uuid
shape before it is written to the cookie, meaning the guarantee currently rests entirely
on every call site happening to pass a real tenant uuid.

### 4. The application layer also double-enforces tenancy via an explicit query filter (defense-in-depth, no issue)
`SupabaseRestAdapter.ts`'s private `withFilters` method (line 103+) sets
`params.set("tenant_id", \`eq.${context.tenantId}\`)` on every request, independent of
RLS. This means tenant isolation is currently enforced twice — once by the app-level
PostgREST filter, once by RLS via the header-derived `current_tenant_id()` — which is
good defense-in-depth and not a finding in itself, but it does mean a bug in either layer
could mask a failure in the other during testing (a query that "looks scoped" via the
app filter might pass tests even if RLS were silently misconfigured, and vice versa).

### 5. Two tenancy roots (`tenants` vs `organizations`) both have RLS-enabled tables, per `DATA_MODEL_DRIFT_REPORT.md` (Critical, cross-ref)
As established in `DATA_MODEL_DRIFT_REPORT.md`, `202606200003_governance_lifecycle
_create.sql` scopes its version of `frameworks`/`projects`/`assets`/`controls` to
`organizations(organization_id)` rather than `tenants(id)`, and separately enables RLS on
those tables (lines 94-98) with policies that do not call `current_tenant_id()` at all
(confirmed: lines 101-140 of that file use `organization_id = ...` conditions, not the
shared `current_tenant_id()` function — this audit did not find a corresponding
`current_organization_id()` function, meaning these policies' actual `using`/`with check`
expressions need to be re-read carefully to confirm what they scope against; flagged here
as the most severe open question of this report). If this second schema is the one
actually live in any environment, the entire `current_tenant_id()`/`x-tenant-id` chain
described in findings 1-3 would not apply to it at all, since it has no tenant_id column
to filter on.

## Severity Table

| Finding | Severity |
|---|---|
| Two parallel tenancy roots, only one of which uses the audited RLS mechanism | Critical |
| `current_tenant_id()` defined three times across the codebase | Medium |
| Header-to-uuid cast has no upstream validation, same failure shape as the frameworks bug | Medium |
| `tenant-isolation.sql` is an honest, self-labeled pattern doc, not a misleading stub | Low (informational correction) |
| Defense-in-depth via both RLS and app-level query filter | None (positive finding) |

## Recommendation

Resolve which schema (`tenants`-rooted or `organizations`-rooted) is canonical before
trusting either RLS policy set in production — this is the same decision
`DATA_MODEL_DRIFT_REPORT.md` already calls for, restated here because it directly
determines which tenant-isolation mechanism is actually active. Add validation at
`setTenantProfile()` (or wherever a tenant id first enters the system) to reject non-uuid
values before they reach a cookie, the `x-tenant-id` header, or `current_tenant_id()`'s
cast. Consolidate the three copies of `current_tenant_id()`/`current_tenant_id.sql` into
one canonical definition referenced by migrations rather than redefined inline each time.
