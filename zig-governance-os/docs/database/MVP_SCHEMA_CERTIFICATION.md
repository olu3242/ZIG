# MVP Schema Certification

## Scope

Audits the MVP data model required for sign up, organization membership, learning, labs, evidence, risk, vendors, AI coaching, auditability, and career progression.

## Current Certification Status

Status: NOT CERTIFIED AGAINST LIVE DATABASE

The previous certification posture assumed local migrations represented the configured Supabase database. That assumption is unsafe. The configured Supabase REST endpoint is reachable, but MVP runtime tables currently return `404`, and SQL-level schema inventory is blocked until the actual ZIG Supabase project can be accessed through CLI, `psql`, or another SQL client.

Do not assume every table belongs in `public`.

## Expected Public/Compatibility Tables

- `tenants`
- `users`
- `projects`
- `frameworks`
- `controls`
- `learning_paths`
- `learning_modules`
- `risks`
- `evidence`
- `audit_events`
- `profiles`
- `auth_events`

## Expected Added Tables

- `organizations`
- `memberships`
- `lessons`
- `user_progress`
- `labs`
- `lab_sessions`
- `lab_artifacts`
- `vendors`
- `ai_conversations`
- `ai_messages`
- `audit_logs`

## Isolation

Tenant-scoped MVP tables include `tenant_id`, indexes, RLS enabled, and policies using `current_tenant_id()`.

`memberships` is isolated through the related `organizations.tenant_id`.

## Relationships

- `lessons` -> `learning_modules`
- `user_progress` -> `users`, `learning_paths`, `learning_modules`, `lessons`
- `lab_sessions` -> `labs`, `users`
- `lab_artifacts` -> `lab_sessions`
- `vendors` -> `tenants`
- `ai_conversations` -> `users`
- `ai_messages` -> `ai_conversations`
- `audit_logs` -> `users`
- `memberships` -> `organizations`, `profiles`

## Certification

MVP schema is not certification-ready until:

1. `scripts/audit-supabase-schemas.sql` is run against the actual ZIG database.
2. Existing non-public schemas are inventoried.
3. Domain schemas are reused or created intentionally.
4. Recovery migrations are adjusted to avoid duplicate tables and public-schema drift.
5. `scripts/verify-mvp-schema.ts` passes against the configured Supabase REST endpoint.
