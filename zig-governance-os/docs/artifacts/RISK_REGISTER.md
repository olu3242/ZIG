# Artifact: Risk Register

## Purpose
The scored, ranked record of identified risks — the artifact every audit, board report,
and treatment plan is built on top of.

## Backing Data
`RiskService` (`packages/services/src/RiskService.ts`, extends `BaseService<RiskRecord>`)
and `RiskService.findAssessments` / `RiskAssessment` — real, exist on `main`.

## Structure
- Risk title, description, linked asset
- Likelihood, impact, computed risk score
- Risk heatmap placement (5x5 grid)
- Treatment decision (accept/mitigate/transfer/avoid) and owner

## Track
Risk

## Lesson
`docs/learning/lessons/risk/01_RISK_FOUNDATIONS.md` through
`05_RISK_MONITORING_METRICS.md`

## Lab
`docs/learning/labs/RISK_LAB_CREATE_ENTERPRISE_RISK_REGISTER.md`

## Skill
Scoring and ranking risk consistently using a likelihood/impact model.

## Career Outcome
Can build and defend an enterprise risk register under audit or board scrutiny.
