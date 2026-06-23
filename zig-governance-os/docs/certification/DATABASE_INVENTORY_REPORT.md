# Database Inventory Report

Status: **UNKNOWN (NOT INDEPENDENTLY VERIFIED) — prior session reported COMPLETE**

Date: 2026-06-20 (original analysis); reviewed 2026-06-21

## Verification Note (2026-06-21)

The table-existence inventory below is carried-forward evidence from a prior session, not independently reproduced here. Outbound access to `lmscairdgavntgnwztfk.supabase.co` is blocked by sandbox network egress policy in the current execution environment, so direct database inspection could not be repeated. Table-existence status is therefore `UNKNOWN` pending direct verification by someone with network access. Findings below are preserved as the original evidence trail.

## Direct Database Inventory

Remote database inspection confirmed these tables exist in `public`:

| Table | Schema | Status | Estimated Rows |
| --- | --- | --- | ---: |
| `organizations` | public | Exists | 0 |
| `projects` | public | Exists | 0 |
| `assets` | public | Exists | 0 |
| `controls` | public | Exists | 0 |
| `asset_control_mappings` | public | Exists | 0 |
| `activities` | public | Exists | 0 |
| `frameworks` | public | Exists | 6 |
| `profiles` | public | Exists | 0 |
| `organization_memberships` | public | Exists | 0 |
| `roles` | public | Exists | 6 |
| `auth_events` | public | Exists | 0 |
| `onboarding_progress` | public | Exists | 0 |
| `user_learning_profiles` | public | Exists | 0 |

## Required CREATE Tables

| Table | Result |
| --- | --- |
| `projects` | Exists |
| `assets` | Exists |
| `controls` | Exists |
| `asset_control_mappings` | Exists |
| `activities` | Exists |

## Database Decision

```text
RUNTIME STATUS = UNKNOWN
Prior session reported required CREATE tables exist in public; not independently verified.
```

