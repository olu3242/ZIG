# Zig MVP Traceability Matrix

Status date: 2026-06-20

Every feature must trace:

```text
Requirement -> Entity -> API/Action -> UI -> Workflow -> Test -> Certification
```

## Matrix

| Feature | Requirement | Entity | API/Action | UI | Workflow | Test | Certification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Organization bootstrap | User belongs to workspace | `organizations`, `organization_memberships` | Auth/onboarding bootstrap | Onboarding/dashboard | Signup/login -> workspace | Partial | Partial |
| Project | Create governance program | `projects` | `createProjectAction`, `updateProjectAction`, `archiveProjectAction` | `/projects`, `/projects/new`, `/projects/[id]` | Create Project | Lint/build | FAIL |
| Asset | Create asset inventory | `assets` | `createAssetAction`, `updateAssetAction`, `archiveAssetAction` | `/assets`, `/projects/[id]` | Create Asset | Lint/build | FAIL |
| Control | Create control library | `controls` | `createControlAction`, `updateControlAction`, `archiveControlAction` | `/controls`, `/projects/[id]` | Create Control | Lint/build | FAIL |
| Asset-control mapping | Link control to asset | `asset_control_mappings` | `linkAssetControlAction` | `/projects/[id]` | Link Control | Lint/build | FAIL |
| Activity | Audit CREATE actions | `activities` | lifecycle activity writer | Mission Control/project detail | Activity Logged | Lint/build | FAIL |
| Governance Score V1 | Score CREATE foundation | `projects.health_score`, derived metrics | `refresh_project_create_score` | Dashboard/Mission Control | Score Updated | Lint/build | FAIL |
| Mission Control | Show CREATE metrics | CREATE tables | `loadCreateLifecycleMetrics` | `/mission-control` | Metrics Updated | Lint/build | FAIL |
| Risk register | Assess risks | `risks` | Missing | `/risk` seeded shell | Assess Risk | Missing | Locked |
| Framework requirements | Map controls to frameworks | `framework_domains`, `framework_requirements` | Missing | `/frameworks` partial | Map Framework | Missing | Locked |
| Readiness | Measure posture | `readiness_snapshots` | Missing | Missing/partial | Measure Readiness | Missing | Locked |
| Gap analysis | Identify gaps | `gap_findings` | Missing | `/gaps` synthetic shell | Identify Gaps | Missing | Locked |
| Tasks | Convert gaps into work | `tasks` | Missing | Missing/shell | Create Task | Missing | Locked |
| Recommendations | Explain next actions | `recommendations` | Missing | Missing/shell | Generate Recommendation | Missing | Locked |
| Reports | Generate executive output | `reports`, `report_runs` | Missing | `/reports` catalog shell | Generate Report | Missing | Locked |

## Traceability Violations

Current shell/catalog pages that must not be certified as complete:

- `/risk`
- `/framework-mapper`
- `/gaps`
- `/reports`
- `/scenarios`

Reason:

They do not yet trace to certified lifecycle records, workflows, tests, and evidence.
