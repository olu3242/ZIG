# 05_VENDOR_LIFECYCLE_MONITORING

## Objectives
- Design an ongoing vendor monitoring cadence based on risk score.
- Identify offboarding triggers and the data-access cleanup they require.
- Close the loop from vendor risk scoring back into the governance score.

## Business Context
This closes the Vendor Risk track by treating vendor relationships as a full lifecycle,
not a one-time onboarding checklist.

## Scenario Mapping
RetailNova (`docs/scenarios/RETAILNOVA.md`) — set a monitoring cadence for its
highest-risk payment processor and define an offboarding checklist for the rest.

## Framework Mapping
Trains on recurring `RiskService.findAssessments` cadence and `Asset` lifecycle status.

## Diagram Requirements
- Vendor monitoring cadence diagram (by risk tier)
- Vendor offboarding/data-access cleanup checklist diagram

## Knowledge Check
1. How should monitoring cadence differ between a high-risk and a low-risk vendor?
2. What must happen to data access when a vendor relationship ends?

## Artifact Produced
Vendor Assessment (lifecycle/monitoring section, final) — see `docs/artifacts/` Vendor Assessment template.

## Visual Assets Required
- Vendor Monitoring Cadence Diagram
- Vendor Offboarding Checklist Diagram
