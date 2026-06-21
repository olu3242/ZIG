# Database Inventory Report

Status: **COMPLETE**

Date: 2026-06-20

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
Required CREATE tables exist in public.
```

The root cause is not missing tables, wrong schema, or migration absence.

