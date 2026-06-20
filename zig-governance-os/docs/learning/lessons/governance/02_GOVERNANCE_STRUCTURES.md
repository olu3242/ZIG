# 02_GOVERNANCE_STRUCTURES

## Objectives
- Design a governance committee structure (board, steering committee, working groups) for a mid-size org.
- Map each structure's authority to a specific entity in the Universal Governance Model.
- Distinguish governance structure from organizational/reporting structure.

## Business Context
Governance scores and recommendations mean nothing without a structure that acts on them.
This lesson builds the human/organizational layer that consumes `GovernanceService`
output — who reviews a score, who approves a control exception, who owns escalation.

## Scenario Mapping
GovSec (`docs/scenarios/GOVSEC.md`) — design a governance structure for its citizen
services program, including who owns its `Recommendation` records.

## Framework Mapping
Trains on `GovernanceService.findRecommendations` and `Role`/`Permission` records
(7-role model in `packages/types/src/index.ts`).

## Diagram Requirements
- Governance committee structure org chart
- Recommendation-to-role escalation flow

## Knowledge Check
1. Which role should own an open `Recommendation` with severity "critical"?
2. What's the difference between a governance structure and an org chart?

## Artifact Produced
Governance Charter draft (see `docs/artifacts/` — Governance Charter template).

## Visual Assets Required
- Governance Committee Org Chart
- Recommendation Escalation Flow Diagram
