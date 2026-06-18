# Multi-Tenant Enforcement

All new platform tables include `tenant_id`, `created_by`, `updated_by`, `created_at`, and `updated_at`.

RLS is enabled for billing, automation, import, export, integrations, API, and webhook tables. Policies use `current_tenant_id()` so tenant-scoped PostgREST requests cannot cross tenant boundaries.

Platform Owner visibility belongs in guarded admin routes and must not weaken tenant RLS for normal tenant sessions.
