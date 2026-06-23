# CREATE Lifecycle Certification

Status: **FAIL - IMPLEMENTED AND MIGRATED, LIVE USER FLOW NOT YET CERTIFIED**

Certification date: 2026-06-20

## Scope

This certification covers Stage 1 only:

```text
Organization
  -> Project
  -> Asset
  -> Control
  -> Asset-Control Mapping
  -> Activity
  -> Governance Score V1
  -> Mission Control
```

ASSESS, IMPROVE, REPORT, Learning OS, AI Governance, and Framework Readiness remain frozen until CREATE is proven.

## Files Created

- `supabase/migrations/202606200004_create_lifecycle_certification.sql`
- `supabase/verify_create_lifecycle_certification.sql`
- `docs/certification/CREATE_LIFECYCLE_CERTIFICATION.md`

## Files Modified

- `apps/web/app/lib/lifecycle.ts`
- `apps/web/app/lib/actions.ts`
- `apps/web/app/projects/[id]/page.tsx`
- `apps/web/app/mission-control/page.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/lib/data.ts`

## Migrations Added

`202606200004_create_lifecycle_certification.sql`

Adds:

- `asset_control_mappings`
- RLS policies for asset-control mappings
- Indexes for relationship lookups
- `assets.status`
- `refresh_project_create_score(project_id)`

Remote migration status:

```text
202606200004 | 202606200004
```

Database lint:

```text
No schema errors found
```

REST smoke checks:

```text
asset_control_mappings 200
assets_status_column 200
activities 200
```

## APIs Added

No REST route handlers were added. CREATE uses server actions backed by Supabase REST:

- `createProjectAction`
- `createAssetAction`
- `createControlAction`
- `linkAssetControlAction`
- `updateProjectAction`
- `updateAssetAction`
- `updateControlAction`
- `archiveProjectAction`
- `archiveAssetAction`
- `archiveControlAction`

## Components Added

No new shared UI package components were required.

Workspace UI was extended with:

- Link Control to Asset form
- Asset archive action
- Control archive action
- Project archive action
- Project edit panel
- Asset edit panel
- Control edit panel
- Asset-Control Relationships table
- CREATE score widget
- Live CREATE Mission Control widgets

## Tests Added

Added SQL verification:

- `supabase/verify_create_lifecycle_certification.sql`

Automated E2E browser tests are still required before PASS.

Local verification:

```text
npm run lint --workspace web: PASS
npm run build: PASS
```

## CREATE Workflow Validation

| Requirement | Evidence | Status |
| --- | --- | --- |
| Create Project | Existing route/action and lifecycle table | Implemented |
| Edit Project | `updateProjectAction` and project edit panel | Implemented |
| Archive Project | `archiveProjectAction` | Implemented |
| View Project | `/projects/[id]` | Implemented |
| Create Asset | `createAssetAction` | Implemented |
| Edit Asset | `updateAssetAction` and asset edit panel | Implemented |
| Archive Asset | `archiveAssetAction` | Implemented |
| View Asset | Asset inventory tables | Partial |
| Create Control | `createControlAction` | Implemented |
| Edit Control | `updateControlAction` and control edit panel | Implemented |
| Archive Control | `archiveControlAction` | Implemented |
| View Control | Control library tables | Partial |
| Link Asset to Control | `asset_control_mappings` + `linkAssetControlAction` | Implemented |
| Activity Logged | Create/archive/link actions create lifecycle activity | Implemented |
| Mission Control Updated | `/mission-control` loads real CREATE metrics | Implemented |
| Governance Score Updated | `refresh_project_create_score` and derived UI score | Implemented |
| Page Refresh Retains State | Supabase-backed reads | Needs live verification |
| RLS Passes | Policies added; linked database lint passed | Partial |
| Tests Pass | Lint/build passed | Partial |

## CREATE Certification Status

**FAIL**

Reason: CREATE has been brought to implementation-ready shape and the database migration is applied, but certification requires live browser/user-flow evidence.

User acceptance reports:

- `docs/certification/CREATE_BROWSER_EXECUTION_EVIDENCE.md`: FAIL
- `docs/certification/CREATE_DATABASE_VALIDATION.md`: FAIL
- `docs/certification/CREATE_MISSION_CONTROL_VALIDATION.md`: FAIL
- `docs/certification/CREATE_RLS_VALIDATION.md`: FAIL
- `docs/certification/CREATE_E2E_CERTIFICATION_REPORT.md`: FAIL
- `docs/certification/create-acceptance/BROWSER_VALIDATION_REPORT.md`: FAIL
- `docs/certification/create-acceptance/PERSISTENCE_VALIDATION_REPORT.md`: FAIL
- `docs/certification/create-acceptance/ACTIVITY_VALIDATION_REPORT.md`: FAIL
- `docs/certification/create-acceptance/MISSION_CONTROL_VALIDATION_REPORT.md`: FAIL
- `docs/certification/create-acceptance/RLS_VALIDATION_REPORT.md`: FAIL
- `docs/certification/create-acceptance/E2E_VALIDATION_REPORT.md`: FAIL

Additional finding:

Read-only REST checks through the current `.env.local` Supabase endpoint returned 404 for CREATE tables, so the deployed/runtime database mapping must be confirmed before accepting persistence evidence.

Required to turn PASS:

1. Run `supabase/verify_create_lifecycle_certification.sql` in SQL Editor or equivalent SQL runner.
2. Complete the browser flow with a real user:

```text
Create Project
  -> Create Asset
  -> Create Control
  -> Link Control to Asset
  -> Confirm Activity Rows
  -> Confirm Mission Control Metrics
  -> Refresh Page
  -> Confirm State Persists
```

Do not begin ASSESS until this document is updated to **PASS** with evidence.
