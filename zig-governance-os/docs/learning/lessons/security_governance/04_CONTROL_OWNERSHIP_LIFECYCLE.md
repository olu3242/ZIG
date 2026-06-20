# 04_CONTROL_OWNERSHIP_LIFECYCLE

## Objectives
- Assign and transition control ownership without losing audit history.
- Move a control through its full lifecycle: planned → implemented → needs_evidence → accepted.
- Handle ownership gaps when a control owner leaves the org.

## Business Context
Ownership is what makes a control actionable rather than decorative — this lesson trains
the operational side of control management that audits actually check.

## Scenario Mapping
CloudPay (`docs/scenarios/CLOUDPAY.md`) — its small security team means ownership gaps are
a real risk this lesson must address directly.

## Framework Mapping
Trains on `Control.ownerId` transitions and `Control.status` progression rules.

## Diagram Requirements
- Control ownership transition diagram
- Ownership-gap escalation flow

## Knowledge Check
1. What should happen to a control's status if its owner leaves and no replacement is assigned?
2. Why must ownership transitions preserve audit history rather than just overwrite `ownerId`?

## Artifact Produced
Control Matrix (ownership column populated) — see `docs/artifacts/` Control Matrix template.

## Visual Assets Required
- Control Ownership Transition Diagram
- Ownership-Gap Escalation Flow Diagram
