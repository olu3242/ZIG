# Operational Intelligence

## Purpose

Operational Intelligence turns Zig from a governance system of record into a governance intelligence platform. It interprets live graph activity into trends, predictions, alerts, and executive summaries.

## Analytics Domains

| Domain | Signals |
|---|---|
| Control Effectiveness | implementation status, test results, maturity, linked incidents, audit findings |
| Risk Velocity | new risks, severity changes, treatment progress, residual risk movement |
| Evidence Quality | freshness, completeness, approval status, expiration, audit acceptance |
| Assessment Trends | completion, scores, recurring gaps, readiness movement |
| Audit Trends | findings, observations, repeat issues, remediation closure |
| Learning Trends | progress, assessment results, lab completion, certification movement |
| Scenario Performance | decisions, scorecards, evidence quality, time efficiency, remediation behavior |

## Predictive Analytics

Zig should predict:

- Audit failure
- Control failure
- Evidence gaps
- Risk escalation
- Certification readiness
- Training gaps

Predictions must be conservative, explainable, and tied to graph signals. They should not be black-box scores.

## Forecasting Inputs

- Historical graph changes
- Current control coverage
- Evidence expiration and rejection patterns
- Risk severity and treatment trend
- Assessment gaps
- Audit finding recurrence
- Learning and scenario performance
- Tenant risk appetite and governance targets

## Executive Intelligence Dashboard

The executive dashboard should answer:

- Are we improving?
- What will fail next?
- Which risks are accelerating?
- Which controls are weakening?
- Which evidence will expire soon?
- Which teams need training?
- Are we ready for audit or certification?

## Human Action Loop

Every intelligence output must connect to action:

```text
Signal -> Insight -> Recommendation -> Task -> Completion -> Score Movement
```

## Acceptance Criteria

- Every prediction includes source signals and confidence.
- Every executive metric can be drilled into the graph.
- Intelligence outputs generate tasks or recommendations, not passive charts only.
- Forecasting respects tenant boundaries and RBAC.
- Trends can be viewed by tenant, project, framework, department, and role where data exists.
