# Backend Architecture

The backend integration layer is composed of Supabase PostgreSQL, Supabase Auth, `packages/data-access`, and `packages/services`.

## Data Access

`SupabaseRestAdapter` talks to Supabase PostgREST with the service role key on the server. The adapter maps TypeScript camelCase records to PostgreSQL snake_case records.

## Services

| Service | Responsibility |
|---|---|
| `TenantService` | Organization provisioning and tenant lookup |
| `UserService` | User profile and persona creation |
| `ProjectService` | Governance project creation and framework assignment |
| `FrameworkService` | Tenant framework listing |
| `AuditService` | Explicit auth/runtime audit events |

## Tenant Isolation

Every repository call requires `TenantContext`. Repository filters always include `tenant_id`, and RLS policies enforce `tenant_id = current_tenant_id()` at the database layer.

## Auditability

Repository mutations emit `audit_events`. Explicit login/logout events are handled by `AuditService` when tenant context exists.
