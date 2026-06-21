# Migration Forensics Report

Status: **COMPLETE**

Date: 2026-06-20

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
No missing CREATE migration.
No failed CREATE migration.
No partial CREATE migration detected.
No wrong migration target detected.
```

The prior 404 responses were not caused by migration failure.

