# Artifact: Vendor Assessment

## Purpose
Documents due diligence, questionnaire results, and a data-access-weighted risk score for
a third-party vendor — the artifact that drives onboarding and monitoring decisions.

## Backing Data
No dedicated `VendorService` exists on `main` today. Vendor assessments are authored
against a vendor modeled as an `AssetRecord` (via `AssetService`) with risk scored using
`RiskService.findAssessments` / `RiskAssessment`, plus a documented data-access multiplier
applied on top of the standard likelihood/impact model. This is a documented gap, not an
invented service.

## Structure
- Vendor profile and data access level
- Due diligence notes
- Questionnaire (scoped to the vendor's access level)
- Risk score with data-access multiplier and rationale
- Monitoring cadence recommendation

## Track
Vendor Risk

## Lesson
`docs/learning/lessons/vendor_risk/02_*` through `04_*` (Due Diligence, Questionnaires &
Evidence, Scoring)

## Lab
`docs/learning/labs/VENDOR_RISK_LAB_ASSESS_PAYMENT_PROCESSORS.md`

## Skill
Scoring vendor risk with a data-access-aware model rather than a flat questionnaire score.

## Career Outcome
Can run third-party risk assessment for vendors with material data access.
