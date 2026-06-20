# Risk Track

Trains learners on risk identification, assessment, and treatment — backed by
`RiskService` (`risks`, `risk_assessments`).

## Learning path: Risk Identification and Treatment

| Module | Type | Duration |
|---|---|---|
| Asset-Driven Risk Identification | lesson | 25 min |
| Likelihood and Impact Scoring | lesson | 30 min |
| Risk Treatment Strategies: Avoid, Mitigate, Transfer, Accept | lesson | 30 min |
| Build a Risk Register for ManufacturX | lab | 60 min |
| Recommend Treatment Decisions for ManufacturX's Top 5 Risks | exercise | 45 min |

## Notes

- Maps to `RiskService.findAssessments` and `RiskAssessment` records; severity/treatment
  vocabulary matches `RiskSeverity`/`RiskTreatment` types exactly.
- Final exercise uses the ManufacturX scenario (`docs/scenarios/MANUFACTURX.md`), an
  OT-heavy environment chosen because it surfaces asset-criticality-driven risk scoring.
