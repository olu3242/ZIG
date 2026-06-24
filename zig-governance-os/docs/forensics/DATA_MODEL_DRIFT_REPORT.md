# Data Model Drift Report

Scope: all 17 files under `supabase/migrations/*.sql`, with focused diffing between
`202606180001_batch_21_core_data_platform.sql` (the original "core data platform" batch)
and `202606200003_governance_lifecycle_create.sql` (a later "governance lifecycle"
migration), the two migrations identified in `FRAMEWORK_IDENTIFIER_AUDIT.md` as defining
conflicting `frameworks` tables.

## Findings

### 1. `frameworks`, `projects`, `assets`, and `controls` are each defined twice, with incompatible shapes (Critical)
`202606180001_batch_21_core_data_platform.sql` defines `tenants`-scoped, `uuid`-PK tables
for all four: `frameworks` (line 106, `id uuid primary key`), `projects` (line 95, `id
uuid primary key`, `framework_id uuid`), `assets` (line 149), `controls` (line 122,
`id uuid primary key`, `framework_id uuid not null references frameworks(id)`).
`202606200003_governance_lifecycle_create.sql` redefines all four under `public.` with
`create table if not exists` and renamed, differently-typed primary keys:
`frameworks.framework_id text primary key` (text business code, e.g. `'iso27001'`),
`projects.project_id uuid primary key` with `framework_focus text not null references
public.frameworks(framework_id)` (a text FK to the text PK, not the uuid one),
`assets.asset_id uuid primary key`, `controls.control_id uuid primary key` (this time
uuid, but a different PK name and an `organizations`/`auth.users` FK target instead of
`tenants`/`users`). Confirmed via direct read of both files (line ranges 95-148 in
batch_21; lines 4-57 in governance_lifecycle_create).

### 2. The two schemas use two different tenancy roots (`tenants` vs `organizations`) (Critical)
`batch_21` scopes everything to `tenants(id)` via `tenant_id uuid not null references
tenants(id)`. `governance_lifecycle_create` scopes everything to
`organizations(organization_id)` via `organization_id uuid not null references
public.organizations(organization_id)`. These are not the same table under a different
name relationship — `tenants` and `organizations` are two separately-created tables (per
the migration filenames, `tenants` from `batch_21` and `organizations` presumably from an
earlier auth-foundation migration). Every multi-tenant guarantee this audit's
`TENANT_INTEGRITY_REPORT.md` evaluates depends on knowing which of these two roots is
authoritative for which table — and the migrations show both roots are live
simultaneously for the same four logical tables.

### 3. `controls` drift changes both the primary key column name and the FK target (High)
`batch_21.controls.framework_id uuid not null references frameworks(id) on delete
restrict` ties a control to a framework via uuid FK. `governance_lifecycle_create
.controls` has no `framework_id` column at all — instead it has `framework_mapping jsonb
not null default '[]'::jsonb`, replacing a relational FK with a denormalized JSON array.
This is a materially different data model, not just a renamed column: one schema
enforces referential integrity at the database level for control-to-framework
relationships, the other pushes that integrity entirely into application code (or
nowhere).

### 4. RLS is enabled on both schemas' versions of these tables independently (High, cross-ref)
`governance_lifecycle_create.sql` lines 94-98 run `alter table public.frameworks /
projects / assets / controls / activities enable row level security`, with policies at
lines 101-140. `batch_21` also enables RLS (16 of 17 migration files match
`enable row level security` per a repo-wide grep). Because Postgres allows `create table
if not exists` to silently no-op if a table of that name already exists, the actual
runtime outcome (which of the two competing schemas wins) depends entirely on migration
*execution order*, not on which file looks newer by date-based filename. This audit did
not execute migrations against a live database, so it cannot confirm which schema is
actually live today — only that both are present in the migration history and both
attempt to own the same four table names.

### 5. `risks`, `evidence`, `tasks`, `audits`, `assessments` show no equivalent second definition (informational, scope-limited)
A targeted check (`create table` greps) found no second `if not exists` redefinition for
`risks`, `evidence`, `tasks`, `audits`, or `assessments` outside `batch_21`. This audit
did not exhaustively diff every column of every table across all 17 migrations — only the
four tables already implicated by the frameworks bug were diffed in full — so this should
be read as "no drift found in this audit's sampling," not "no drift exists."

## Severity Table

| Finding | Severity |
|---|---|
| Two tenancy roots (`tenants` vs `organizations`) both live across schemas | Critical |
| `frameworks`/`projects`/`assets`/`controls` each defined twice, incompatibly | Critical |
| `controls.framework_id` FK replaced by `framework_mapping` jsonb in second schema | High |
| RLS enabled independently on both competing schema versions | High |
| Other 5 core tables not found to have a second definition (sampling-limited) | Informational |

## Recommendation

Run `\d+ frameworks`, `\d+ projects`, `\d+ assets`, `\d+ controls` against the actual
target database to determine empirically which schema version is live — this audit could
not do so without write/db access. Once known, retire the losing migration's CREATE
statements (rewriting migration history is invasive; at minimum, document which one is
authoritative in a follow-up doc) and reconcile `tenants` vs `organizations` into a single
tenancy root before any further tables are added. Treat the `controls.framework_mapping`
jsonb vs `framework_id` uuid FK divergence as a product decision, not just a bug — decide
once whether control-to-framework relationships should be relational or denormalized, and
apply that decision consistently in the next migration.
