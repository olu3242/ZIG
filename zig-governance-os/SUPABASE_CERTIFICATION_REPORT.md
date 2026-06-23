# Supabase Certification Report

Date: 2026-06-18  
Status: PARTIAL

## Certified Locally

- Migrations define core tenant-scoped tables.
- RLS policies are defined in migrations.
- Web auth calls Supabase Auth REST for signup, login, and password reset.
- Web and admin server code require Supabase environment variables.
- Local build and tests pass.

## Evidence

- Core schema: `supabase/migrations/202606180001_batch_21_core_data_platform.sql`
- RLS policies: `supabase/migrations/202606180001_batch_21_core_data_platform.sql`
- Web Supabase runtime: `apps/web/app/lib/supabase.ts`
- Admin Supabase runtime: `apps/admin/app/lib/platform-data.ts`
- Repository adapter: `packages/data-access/src/SupabaseRestAdapter.ts`

## Tenant Isolation Finding

Tenant isolation is not fully certified.

The runtime uses Supabase REST with the service role key. Service role bypasses RLS, so production isolation currently depends on repository-level tenant filters such as `tenant_id=eq.<tenant>`.

## Required Before Full Certification

1. Run Supabase migrations against staging.
2. Create Tenant A and Tenant B data.
3. Verify Tenant A cannot read or mutate Tenant B data through UI paths.
4. Verify Tenant A cannot read or mutate Tenant B data through any API/export/report path.
5. Add automated negative tests against Supabase REST.
6. Decide whether service-role app filtering or user-JWT RLS is the official enforcement model.

## Certification Decision

PARTIAL. Schema and app integration exist, but tenant isolation is not fully certified until staging negative tests prove cross-tenant denial.
