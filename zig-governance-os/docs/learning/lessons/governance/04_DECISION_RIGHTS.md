# 04_DECISION_RIGHTS

## Objectives
- Define who can approve, who can veto, and who is merely consulted for a governance decision.
- Apply a RACI-style model to control approval and risk acceptance decisions.
- Identify decision-rights gaps that block governance program execution.

## Business Context
A governance score can flag a gap, but nothing improves until someone with the authority
to act actually decides. This lesson makes decision rights explicit instead of assumed.

## Scenario Mapping
GovSec (`docs/scenarios/GOVSEC.md`) — assign decision rights for accepting risk on its
"Respond Function Controls (NIST CSF)" gap (status: needs_evidence).

## Framework Mapping
Trains on `RiskService` (`RiskTreatment` = accept requires a decision-rights holder) and
`Role`/`Permission` records.

## Diagram Requirements
- RACI matrix for control approval and risk acceptance
- Decision-rights escalation path diagram

## Knowledge Check
1. Who should hold "accept" authority for a critical-severity risk: Risk Analyst or Tenant Admin?
2. What's the failure mode of a governance program with no documented decision rights?

## Artifact Produced
Control Matrix (decision-rights column populated) — see `docs/artifacts/` Control Matrix template.

## Visual Assets Required
- RACI Decision Rights Matrix
- Decision Escalation Path Diagram
