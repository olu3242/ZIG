# 03_RISK_ASSESSMENT_SCORING

## Objectives
- Score a risk's likelihood and impact on a 1-5 scale with defensible rationale.
- Derive a `RiskSeverity` (low/medium/high/critical) from likelihood × impact.
- Build a risk heatmap from a set of scored risks.

## Business Context
Severity must be derived, not guessed — this lesson trains the actual scoring mechanics
behind `RiskAssessment` so severity labels are consistent across analysts.

## Scenario Mapping
ManufacturX (`docs/scenarios/MANUFACTURX.md`) — score its "No Tested DR Failover for Plant 1" risk.

## Framework Mapping
Trains on `RiskAssessment` (`likelihood`, `impact`, `severity`) and
`RiskService.findAssessments`.

## Diagram Requirements
- Risk Scoring Matrix (5x5 likelihood/impact grid)
- Risk Heatmap (portfolio view)

## Knowledge Check
1. A risk scored likelihood=4, impact=5 — what severity band does that map to?
2. Why should two analysts scoring the same risk independently get the same severity?

## Artifact Produced
Risk Register (severity column populated) — see `docs/artifacts/` Risk Register template.

## Visual Assets Required
- Risk Scoring Matrix (5x5 grid)
- Risk Heatmap
