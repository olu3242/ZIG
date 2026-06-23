# E2E Workflow Traceability

Status: **INCOMPLETE**

## Target Workflow

```text
Create Project
  -> Create Asset
  -> Create Control
  -> Assess Risk
  -> Map Framework
  -> Measure Readiness
  -> Generate Recommendation
  -> Create Task
  -> Complete Task
  -> Improve Score
  -> Generate Report
```

## Traceability Matrix

| Step | Status | Evidence | Gap |
| --- | --- | --- | --- |
| Create Project | Partially implemented | Project action/table/UI exist | Browser persistence evidence missing |
| Create Asset | Partially implemented | Asset action/table/UI exist | Browser persistence evidence missing |
| Create Control | Partially implemented | Control action/table/UI exist | Browser persistence evidence missing |
| Link Control | Partially implemented | `asset_control_mappings`, link action/UI exist | Browser/database evidence missing |
| Activity Logged | Partially implemented | CREATE actions write activity | Required named activity rows not proven |
| Mission Control Updated | Partially implemented | CREATE metrics wired | Browser evidence missing |
| Refresh/Persistence | Missing evidence | Supabase-backed reads designed | Browser evidence missing |
| RLS Verified | Missing evidence | Policies exist | Cross-tenant proof missing |
| Assess Risk | Missing | Risk UI uses seeded data | Need risk tables/actions/workflow |
| Map Framework | Partial | `frameworks` metadata exists | Need requirements and control mappings |
| Measure Readiness | Missing | No readiness engine | Need coverage/readiness calculations |
| Generate Recommendation | Missing | No recommendation engine | Need gaps/readiness/risk signals |
| Create Task | Missing | No certified task engine | Need source-linked tasks |
| Complete Task | Missing | No task lifecycle | Need completion and score impact |
| Improve Score | Missing | CREATE score only | Need Governance Score V2 and readiness impact |
| Generate Report | Missing | Report catalog shell only | Need report runs/exports |

## Traceability Decision

The full workflow cannot be certified today.

Current workflow support:

```text
Create Project -> Create Asset -> Create Control -> Link Control
```

is implemented but not acceptance-certified.

Everything after CREATE remains missing or locked.
