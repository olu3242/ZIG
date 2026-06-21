# Data Flow Trace Report

Status: **ROOT CAUSE ISOLATED**

Date: 2026-06-20

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

The identified failure point is the forensic REST validation script, not the app data flow.

CREATE browser certification is still required to validate the app path end-to-end.

