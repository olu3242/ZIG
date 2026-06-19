# MVP Schema Certification

## Scope

Verified the MVP data model required for sign up, organization membership, learning, labs, evidence, risk, vendors, AI coaching, auditability, and career progression.

## Existing Tables

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

## Added Tables

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

MVP schema is certification-ready after applying:

- `202606190002_mvp_convergence_schema.sql`
- `supabase/seed/mvp_seed.sql`
