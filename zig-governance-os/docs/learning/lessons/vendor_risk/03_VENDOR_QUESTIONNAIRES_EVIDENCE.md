# 03_VENDOR_QUESTIONNAIRES_EVIDENCE

## Objectives
- Design a vendor security questionnaire scoped to the vendor's data access level.
- Request and evaluate vendor-submitted evidence using the same evidence model as internal controls.
- Identify when a vendor's questionnaire answers contradict submitted evidence.

## Business Context
Vendor questionnaires only have teeth if backed by evidence — this lesson reuses the same
`Evidence` model internal controls use, so vendor risk doesn't need a parallel workflow.

## Scenario Mapping
RetailNova (`docs/scenarios/RETAILNOVA.md`) — questionnaire its top 3 payment processors.

## Framework Mapping
Trains on `Evidence` records scoped to vendor `Control`/`Asset` pairs; no separate
vendor-questionnaire service exists yet in `packages/services/src` (curriculum-only
reference, not a current code path).

## Diagram Requirements
- Vendor questionnaire structure diagram
- Questionnaire-vs-evidence contradiction-detection flow

## Knowledge Check
1. Why does a vendor questionnaire need backing evidence to be trustworthy?
2. What should happen when a vendor's questionnaire answer contradicts its submitted evidence?

## Artifact Produced
Vendor Assessment — see `docs/artifacts/` Vendor Assessment template.

## Visual Assets Required
- Vendor Questionnaire Structure Diagram
- Questionnaire-vs-Evidence Contradiction Flow
