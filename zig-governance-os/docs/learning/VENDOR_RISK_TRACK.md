# Vendor Risk Track

Trains learners on third-party/vendor risk assessment — backed by `RiskService` combined
with `Asset` records where `category` represents a vendor relationship (no separate vendor
schema exists; vendors are modeled as assets, consistent with the Universal Governance
Model's no-orphan-entity rule).

## Learning path: Third-Party Risk Assessment

| Module | Type | Duration |
|---|---|---|
| Vendors as Assets: Why There Is No Separate Vendor Table | lesson | 20 min |
| Vendor Risk Questionnaires and Evidence Requests | lesson | 30 min |
| Scoring Vendor Criticality and Risk | lesson | 25 min |
| Assess RetailNova's Top 3 Payment Processors | lab | 55 min |
| Recommend Vendor Risk Treatment for RetailNova | exercise | 40 min |

## Notes

- Maps to `RiskService` + `Asset.category`. No vendor-questionnaire service exists yet in
  `packages/services/src` — that module is referenced by curriculum content only, not by
  any current code path.
- Final exercise uses the RetailNova scenario (`docs/scenarios/RETAILNOVA.md`).
