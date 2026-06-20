# 03_RTO_RPO_PLANNING

## Objectives
- Set a Recovery Time Objective (RTO) and Recovery Point Objective (RPO) for a critical asset.
- Justify RTO/RPO targets against the BIA's downtime-cost data.
- Identify the gap between target and current actual recovery capability.

## Business Context
RTO/RPO turn the BIA's cost curve (Lesson 02) into concrete recovery targets the
continuity plan (Lesson 04) must be designed to hit.

## Scenario Mapping
ManufacturX (`docs/scenarios/MANUFACTURX.md`) — set RTO/RPO for Plant 1, which currently
has no tested failover at all.

## Framework Mapping
Trains on `ScenarioRun.scoreDelta` as a proxy for recovery-capability measurement against target.

## Diagram Requirements
- RTO/RPO definition diagram
- Target-vs-actual recovery capability gap chart

## Knowledge Check
1. What's the difference between RTO and RPO?
2. Why should RTO/RPO targets be derived from the BIA rather than set arbitrarily?

## Artifact Produced
BIA (RTO/RPO section) — see `docs/artifacts/` BIA template.

## Visual Assets Required
- RTO/RPO Definition Diagram
- Target-vs-Actual Recovery Capability Gap Chart
