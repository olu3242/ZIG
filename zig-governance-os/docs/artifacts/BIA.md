# Artifact: Business Impact Analysis (BIA)

## Purpose
Quantifies downtime cost over time for a critical asset, and is the justification every
RTO/RPO target and continuity plan must trace back to.

## Backing Data
No dedicated `BCMService` exists on `main` today. A BIA is authored against the affected
asset modeled as an `AssetRecord` (via `AssetService`), with downtime-cost figures
documented as analyst-derived inputs rather than pulled from a live financial-impact
service. This is a documented gap, not an invented service.

## Structure
- Affected asset and dependency mapping
- Downtime cost curve over time (justified, not arbitrary)
- Derived RTO/RPO targets
- Single points of failure identified

## Track
BCM/DR

## Lesson
`docs/learning/lessons/bcm_dr/02_*` (BIA), `03_*` (RTO/RPO)

## Lab
`docs/learning/labs/BCM_DR_LAB_RUN_DISRUPTION_SCENARIO.md`

## Skill
Deriving RTO/RPO targets from a quantified downtime-cost analysis, not setting them
independently.

## Career Outcome
Can produce a BIA that withstands an auditor's challenge of unjustified RTO/RPO targets.
