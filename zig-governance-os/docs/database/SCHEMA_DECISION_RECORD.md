# Schema Decision Record

Generated: 2026-06-20

## Decision

ZIG should not place all Learning OS, Simulation Engine, Assessment, Portfolio, Certification, and AI data in `public`.

`public` should remain the gateway/API compatibility layer for:

- profiles
- organizations
- user roles
- lightweight compatibility views required by current REST clients

Domain data should live in first-class schemas:

- `learning`
- `frameworks`
- `simulation`
- `assessment`
- `portfolio`
- `certification`
- `ai`

## Rationale

ZIG is not a small CRUD app. Its data model spans GRC operations, learning, realistic company simulations, assessment attempts, certification journeys, portfolios, and AI coaching. Keeping those domains in `public` creates future refactor pressure and makes ownership, RLS, backup, analytics, and API exposure harder to reason about.

The Simulation schema should be first-class from day one because the product experience depends on realistic companies, departments, incidents, audits, vendors, evidence, and risk registers.

## Implementation Rule

Before applying migrations:

1. Run SQL schema inventory against the actual Supabase database.
2. Identify existing non-public schemas.
3. Reuse existing schemas when they match the domain.
4. Extend existing schemas rather than duplicating entities.
5. If only `public` exists, create the domain schemas listed above.
6. Keep public compatibility views only where the current application code requires public REST object names.

## Proposed Domain Mapping

| Domain | Schema | Tables |
| --- | --- | --- |
| Identity | public | `profiles`, `organizations`, `user_roles` |
| Learning OS | learning | `learning_paths`, `courses`, `modules`, `lessons`, `lesson_progress` |
| Framework Intelligence | frameworks | `frameworks`, `framework_domains`, `framework_mappings` |
| Simulation Engine | simulation | `companies`, `departments`, `employees`, `scenarios`, `artifacts` |
| Assessment Engine | assessment | `assessments`, `questions`, `attempts` |
| Portfolio | portfolio | `portfolio_artifacts` |
| Certification | certification | `certifications`, `user_certifications` |
| AI Coach | ai | `coaching_sessions`, `recommendations` |

## Compatibility Strategy

Current app services use Supabase REST object names such as `learning_paths`, `learning_modules`, `frameworks`, `assessments`, `scenarios`, and `audit_events`.

To avoid breaking the app while moving to domain schemas:

- Create domain tables as the source of truth.
- Expose `public` compatibility views only where needed.
- Configure Supabase API schemas to include the domain schemas.
- Migrate app repositories to explicit schema-qualified endpoints in a later batch.

## Current Status

SQL inventory is not yet complete because the local machine cannot access the configured ZIG Supabase project through CLI metadata or `psql`. The existing recovery migration should be treated as a compatibility draft, not a final production schema design.
