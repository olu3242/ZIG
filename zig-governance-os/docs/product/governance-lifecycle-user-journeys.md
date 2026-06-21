# Governance Lifecycle User Journeys

## Primary MVP Journey

```text
Create Project
  -> Select Framework
  -> Add Assets
  -> Add Controls
  -> Review Project Health
  -> Assess Risks
  -> Measure Readiness
  -> Accept Recommendations
  -> Complete Tasks
  -> Run Scenario
  -> Generate Executive Report
```

## Stage 1 Journey

1. User enters `/projects`.
2. User creates a governance project.
3. Zig records CREATE activity.
4. User opens project workspace.
5. User adds assets.
6. User adds controls.
7. Zig updates project health summary from project, asset, and control coverage.

## Failure Recovery

If a project has no assets, Zig shows the next action: add the first asset.

If a project has no controls, Zig shows the next action: add the first control.

If a user has no project, Zig shows the next action: create the first governance project.
