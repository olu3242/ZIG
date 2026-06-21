# Schema Inventory

Generated: 2026-06-20

## Audit Position

Status: BLOCKED FOR SQL-LEVEL CERTIFICATION

Do not assume all ZIG tables belong in `public`.

The repository can reach the configured Supabase REST and Storage endpoints, but the current local machine cannot run the SQL inventory against the configured ZIG database because:

- Supabase CLI cannot link to project ref `lmscairdgavntgnwztfk` with the authenticated account.
- `psql` is not installed locally.
- No existing Node Postgres client dependency is available in this repo.

## Required SQL Audit

Run [audit-supabase-schemas.sql](../../scripts/audit-supabase-schemas.sql) against the actual ZIG Supabase database before applying any schema migration.

The required audit queries are:

```sql
select schema_name
from information_schema.schemata
order by schema_name;

select
  table_schema,
  table_name
from information_schema.tables
where table_type = 'BASE TABLE'
and table_schema not in (
  'pg_catalog',
  'information_schema'
)
order by table_schema, table_name;

select
  routine_schema,
  routine_name
from information_schema.routines
where routine_schema not in (
  'pg_catalog',
  'information_schema'
)
order by routine_schema, routine_name;
```

## REST Probe Result

The configured Supabase REST API returned `404` for MVP runtime tables including:

- `profiles`
- `auth_events`
- `tenants`
- `users`
- `organizations`
- `roles`
- `projects`
- `frameworks`
- `learning_paths`
- `learning_modules`
- `lessons`
- `scenarios`
- `scenario_runs`
- `assessments`
- `artifacts`
- `audit_events`

Storage returned `200`, so the Supabase project is reachable.

## Inventory Status

| Area | SQL Inventory Status | REST Probe Status | Decision |
| --- | --- | --- | --- |
| Schemas | Not verified | Not available through REST | Run SQL audit first |
| Tables | Not verified by schema | MVP REST tables missing | Do not assume `public` only |
| Functions | Not verified | Not visible through REST | Run SQL audit first |
| Triggers | Not verified | Not visible through REST | Run SQL audit first |
| RLS policies | Not verified | Not visible through REST | Run SQL audit first |
| Storage buckets | Partially verified | Storage API reachable | Not a blocker for schema split |

## Production Schema Target

If the SQL audit confirms only `public` exists for application tables, use this production structure:

| Schema | Ownership |
| --- | --- |
| public | Identity, profiles, organizations, user roles, compatibility API views |
| learning | Learning paths, courses, modules, lessons, lesson progress |
| frameworks | Framework registry, domains, mappings |
| simulation | Simulated companies, departments, employees, scenarios, artifacts |
| assessment | Assessments, questions, attempts |
| portfolio | Portfolio artifacts |
| certification | Certifications, user certifications |
| ai | Coaching sessions, recommendations |

## Rule

No new schema migration should be applied until this inventory is completed against the actual ZIG Supabase database.
