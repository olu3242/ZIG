# Schema Discovery Report

Generated: 2026-06-20

## Executive Finding

The configured Supabase project is reachable through REST and Storage, but every probed MVP runtime table returned `404`. This indicates schema-not-applied drift, not an application routing problem.

Supabase CLI project linking is also not configured for this checkout. `supabase migration list --linked` could not run because the CLI could not find a project ref. The app environment points to Supabase ref `lmscairdgavntgnwztfk`; the authenticated CLI project list did not include that ref.

Important: this is not a complete SQL schema audit. REST probing cannot prove that all schemas are absent, and it cannot inspect non-public schemas, functions, triggers, or policies. Do not assume everything belongs in `public`.

## Discovery Sources

| Source | Result |
| --- | --- |
| `.env.local` Supabase REST probe | Reachable |
| Storage bucket endpoint | Reachable, `200` |
| Supabase CLI linked migration history | Unavailable, project not linked |
| Local migrations | Present under `supabase/migrations` |
| Application code scan | Runtime repository layer uses REST against tenant-scoped tables |
| SQL `information_schema` audit | Blocked; Supabase CLI access denied and `psql` unavailable |

## Runtime Table Inventory

| Object | Exists | Used by Code | Status |
| --- | --- | --- | --- |
| profiles | No | Yes, auth profile bootstrap | Missing in configured DB |
| auth_events | No | Yes, login/signup/logout audit | Missing in configured DB |
| tenants | No | Yes, TenantService | Missing in configured DB |
| users | No | Yes, tenant profile resolution | Missing in configured DB |
| organizations | No | Seed/onboarding compatibility | Missing in configured DB |
| organization_members | No | Bootstrap compatibility | Missing in configured DB |
| roles | No | Yes, RBAC seed/bootstrap | Missing in configured DB |
| permissions | No | Yes, RBAC model | Missing in configured DB |
| role_permissions | No | Yes, RBAC model | Missing in configured DB |
| projects | No | Yes, ProjectService | Missing in configured DB |
| project_frameworks | No | Yes, project framework assignment | Missing in configured DB |
| frameworks | No | Yes, FrameworkService and onboarding | Missing in configured DB |
| controls | No | Yes, ControlService | Missing in configured DB |
| assessments | No | Yes, Assessment routes/model | Missing in configured DB |
| learning_paths | No | Yes, LearningService/model | Missing in configured DB |
| learning_modules | No | Yes, LearningService/model | Missing in configured DB |
| lessons | No | Yes, Learning OS routes/seed | Missing in configured DB |
| user_progress | No | Yes, learner progress model | Missing in configured DB |
| scenarios | No | Yes, ScenarioService/model | Missing in configured DB |
| scenario_runs | No | Yes, ScenarioService/model | Missing in configured DB |
| artifacts | No | Yes, portfolio/runtime recovery | Missing in configured DB |
| audit_events | No | Yes, repository audit sink | Missing in configured DB |
| activity_log | No | Requested alias | Missing in configured DB |

## Views

The recovery migration creates compatibility views:

| View | Backing Object | Purpose |
| --- | --- | --- |
| modules | learning_modules | Prompt vocabulary compatibility |
| simulations | scenarios | Simulation vocabulary compatibility |
| simulation_runs | scenario_runs | Simulation run compatibility |
| activity_log | audit_logs | Audit log compatibility |

## Functions

| Function | Exists in Local Migration | Purpose |
| --- | --- | --- |
| current_tenant_id | Yes | Tenant isolation from app setting, REST header, or JWT metadata |
| set_updated_at | Yes | Common update timestamp trigger |
| set_tenant_self_id | Yes | Keeps `tenants.tenant_id = tenants.id` |
| bootstrap_new_user | Yes | Auth user bootstrap into profile, tenant, role, user, organization membership |
| is_tenant_admin | Yes | RLS admin override inside tenant |

## Triggers

| Trigger | Table | Purpose |
| --- | --- | --- |
| on_auth_user_created_bootstrap | auth.users | Automatic profile, tenant, user, membership, auth event creation |
| set_*_updated_at | MVP mutable tables | Updated timestamp maintenance |
| set_tenants_self_id | tenants | Tenant self-id enforcement |

## RLS Policies

The recovery migration enables RLS on all MVP tables and creates:

| Policy | Scope | Purpose |
| --- | --- | --- |
| `*_tenant_access` | Tenant-scoped runtime tables | Enforce current tenant or tenant admin |
| profiles_self_select | profiles | Users can read their own profile |
| profiles_self_update | profiles | Users can update their own profile |
| auth_events_self_select | auth_events | Users can read their own auth events |
| auth_events_service_insert | auth_events | Server-side auth audit insertion |

## Storage Buckets

The Storage API is reachable, but no application code currently calls `.storage.`. Buckets are not required for the MVP access recovery path.

## Required SQL Audit

Before applying a recovery migration, run [audit-supabase-schemas.sql](../../scripts/audit-supabase-schemas.sql) against the configured ZIG Supabase database.

## Conclusion

The configured Supabase REST API does not currently expose the MVP schema expected by the application. However, a final migration decision requires SQL-level schema inventory first. Treat `supabase/migrations/ZZZ_mvp_core_platform_recovery.sql` as a recovery draft until the database schemas are inventoried and the domain-schema strategy is confirmed.
