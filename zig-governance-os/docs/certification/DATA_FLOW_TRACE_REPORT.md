# Data Flow Trace Report

Status: **CODE PATH CONFIRMED; RUNTIME BEHAVIOR UNKNOWN (NOT INDEPENDENTLY VERIFIED)**

Date: 2026-06-20 (original analysis); reviewed 2026-06-21

## Verification Note (2026-06-21)

The "Code Path" table below was independently re-verified this session by reading the actual source: `createProjectAction`, `createAssetAction`, `createControlAction`, `linkAssetControlAction` in `apps/web/app/lib/actions.ts`, and `createLifecycleProject`, `createLifecycleAsset`, `createLifecycleControl`, `linkLifecycleAssetControl`, `createLifecycleActivity` in `apps/web/app/lib/lifecycle.ts` all exist and wire together as described.

**Not independently verified**: that this code path actually succeeds end-to-end against the live database (no browser run, no real request was executed this session — outbound access to `lmscairdgavntgnwztfk.supabase.co` is blocked by sandbox network egress policy). The claim that the forensic PowerShell script (not the app) caused the 404s is carried-forward from a prior session and unconfirmed here.

## Target Flow

```text
UI
  -> Server Action
  -> lifecycle service
  -> Supabase REST
  -> public tables
```

## Code Path

| Workflow | Action | Service | REST Table |
| --- | --- | --- | --- |
| Create Project | `createProjectAction` | `createLifecycleProject` | `projects` |
| Create Asset | `createAssetAction` | `createLifecycleAsset` | `assets` |
| Create Control | `createControlAction` | `createLifecycleControl` | `controls` |
| Link Control | `linkAssetControlAction` | `linkLifecycleAssetControl` | `asset_control_mappings` |
| Activity | lifecycle activity writer | `createLifecycleActivity` | `activities` |

## Runtime REST Construction in App

The application lifecycle service uses `URLSearchParams` for GET queries and fixed table names for POST/PATCH calls.

This is not the same failure path as the forensic PowerShell check.

## Failed Forensic Path

The failed validation command built URLs with:

```powershell
"/rest/v1/$table?select=*&limit=1"
```

Generated:

```text
/rest/v1/=*&limit=1
```

This caused false 404 responses.

## Decision

```text
App code path = CONFIRMED (independently verified 2026-06-21)
Runtime success of that code path against live DB = UNKNOWN (not independently verified)
```

CREATE browser certification is still required to validate the app path end-to-end.

