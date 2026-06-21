# Governance Lifecycle Information Architecture

## Navigation Model

```text
Mission Control
  -> Create
     -> Projects
     -> Assets
     -> Controls
  -> Assess
     -> Risks
     -> Frameworks
     -> Readiness
  -> Improve
     -> Tasks
     -> Health Advisor
     -> Scenarios
  -> Report
     -> Dashboards
     -> Executive Reports
```

## Stage 1 Routes

| Route | Lifecycle Stage | Purpose |
| --- | --- | --- |
| `/projects` | CREATE | Program inventory and project health |
| `/projects/new` | CREATE | Create governance project |
| `/projects/[id]` | CREATE | Project workspace |
| `/assets` | CREATE | Asset inventory across projects |
| `/controls` | CREATE | Operational control library |

## Drill-Down Rule

Every dashboard widget must link to the record set that produced it. Summary without drill-down is not acceptable for MVP.

## Zero Empty State Rule

An empty list must explain the missing lifecycle dependency and provide a direct action.
