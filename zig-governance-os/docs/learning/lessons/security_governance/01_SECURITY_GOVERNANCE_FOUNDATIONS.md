# 01_SECURITY_GOVERNANCE_FOUNDATIONS

## Objectives
- Distinguish security governance (control design/ownership) from security operations (detection/response).
- Explain the `Control` lifecycle status union and what each status means in practice.
- Identify why a control needs an owner before it can move past "planned".

## Business Context
Security governance is where strategy becomes a control someone is accountable for — this
lesson sets up the cross-framework control design work that follows.

## Scenario Mapping
CloudPay (`docs/scenarios/CLOUDPAY.md`) — its controls span planned and needs_evidence states.

## Framework Mapping
Trains on `Control.status` (`ControlStatus`: planned/implemented/needs_evidence/accepted)
and `Control.ownerId`.

## Diagram Requirements
- Control Lifecycle Status Diagram
- Security governance vs. operations boundary diagram

## Knowledge Check
1. What's the difference between security governance and security operations?
2. Why can't a control meaningfully progress past "planned" without an owner?

## Artifact Produced
None (foundational); first Control Matrix entry appears in 02_CONTROL_DESIGN_PRINCIPLES.

## Visual Assets Required
- Control Lifecycle Status Diagram
- Governance-vs-Operations Boundary Diagram
