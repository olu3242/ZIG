# Migration Forensics Report

Status: **PARTIALLY VERIFIED — migration files confirmed present locally; remote-applied state UNKNOWN**

Date: 2026-06-20 (original analysis); reviewed 2026-06-21

## Verification Note (2026-06-21)

Independently confirmed this session: all four migration files referenced below exist in `supabase/migrations/` in this branch's working tree (`202606200001_auth_foundation.sql`, `202606200002_onboarding_experience.sql`, `202606200003_governance_lifecycle_create.sql`, `202606200004_create_lifecycle_certification.sql`).

**Not independently verified**: whether these migrations were actually applied to the remote database (the "Remote migration state" table below) and the "Direct DB inspection" table listing. Both require Supabase CLI/database access, which is unavailable from this environment (outbound access to `lmscairdgavntgnwztfk.supabase.co` is blocked by sandbox network egress policy). Those claims remain carried-forward evidence from a prior session.

## Migration History

Remote migration state:

```text
202606200001 | 202606200001
202606200002 | 202606200002
202606200003 | 202606200003
202606200004 | 202606200004
```

## Expected CREATE Tables

| Migration | Expected Result | Status |
| --- | --- | --- |
| `202606200001_auth_foundation.sql` | Foundation identity tables | Applied |
| `202606200002_onboarding_experience.sql` | Onboarding tables | Applied |
| `202606200003_governance_lifecycle_create.sql` | `projects`, `assets`, `controls`, `activities`, `frameworks` | Applied |
| `202606200004_create_lifecycle_certification.sql` | `asset_control_mappings`, asset status, score function | Applied |

## Actual Tables

Direct DB inspection confirms:

```text
public.projects
public.assets
public.controls
public.activities
public.asset_control_mappings
public.frameworks
```

## Decision

```text
Migration files present locally = CONFIRMED
Remote-applied migration state = UNKNOWN (not independently verified)
RUNTIME STATUS = UNKNOWN
```

