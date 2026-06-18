# Persona Architecture

## Purpose

Zig personas define the role-specific operating context loaded immediately after authentication. They do not replace RBAC; they shape navigation, defaults, and permitted work surfaces.

## Personas

| Persona | Primary Use |
|---|---|
| Platform Owner | Owns Zig platform operations and cross-tenant oversight |
| Platform Admin | Administers platform runtime and support operations |
| Tenant Admin | Manages one tenant workspace |
| Governance Manager | Coordinates governance execution |
| Risk Manager | Owns risk workflow and treatment decisions |
| Compliance Manager | Manages framework and control compliance |
| Auditor | Reviews evidence, assessments, and audit trails |
| Executive | Consumes Mission Control and score reporting |
| Learner | Uses learning and scenario surfaces |
| Consultant | Supports tenant implementations |

## Storage

The current vertical slice stores persona on `users.persona`. The `users` row also stores `tenant_id`, `role_id`, and `auth_user_id` so identity, tenant isolation, RBAC, and experience orchestration remain connected.

## Load Flow

1. User authenticates through Supabase Auth.
2. Zig reads the tenant-scoped `users` profile by `auth_user_id` or email.
3. Zig loads `persona` and role metadata.
4. Protected routes evaluate tenant context and persona access.
5. Admin routes require `Platform Owner`.

## Traceability

Persona changes are user updates and must emit `audit_events` through the repository layer.
