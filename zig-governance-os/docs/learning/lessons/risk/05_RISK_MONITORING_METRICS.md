# 05_RISK_MONITORING_METRICS

## Objectives
- Track risk treatment progress over time using `RiskAssessment` history.
- Build a risk trend metric feeding into the governance score's `riskTreatment` input.
- Identify when a previously-accepted risk needs reassessment.

## Business Context
Risk programs need a feedback loop, not a one-time snapshot — this lesson closes the loop
from treatment decision back into the governance score that started the program.

## Scenario Mapping
ManufacturX (`docs/scenarios/MANUFACTURX.md`) — monitor its risk register's trend after
the network segmentation control is implemented.

## Framework Mapping
Trains on `RiskService.findAssessments` over time and `GovernanceScore.riskTreatment`.

## Diagram Requirements
- Risk trend-over-time chart
- Reassessment trigger flow (what conditions force a re-score)

## Knowledge Check
1. What event should trigger reassessment of an already-accepted risk?
2. How does an improving risk-treatment trend show up in the governance score?

## Artifact Produced
Risk Register (monitoring/trend section) — see `docs/artifacts/` Risk Register template.

## Visual Assets Required
- Risk Trend-Over-Time Chart
- Reassessment Trigger Flow Diagram
