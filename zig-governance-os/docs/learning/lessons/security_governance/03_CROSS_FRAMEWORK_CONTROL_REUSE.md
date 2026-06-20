# 03_CROSS_FRAMEWORK_CONTROL_REUSE

## Objectives
- Design one control that satisfies requirements across ISO 27001, SOC 2, and NIST CSF simultaneously.
- Use `ControlMapping` to document the cross-framework relationship.
- Avoid creating duplicate near-identical controls per framework.

## Business Context
This is the practical payoff of "frameworks are metadata" — one well-designed control,
properly mapped, replaces three redundant framework-specific controls.

## Scenario Mapping
CloudPay (`docs/scenarios/CLOUDPAY.md`) — design and map a single encryption control
across both of its target frameworks.

## Framework Mapping
Trains on `ControlService.findMappings` and `ControlMapping.targetFrameworkId`.

## Diagram Requirements
- Cross-framework control reuse diagram (one control, three framework requirements)
- Duplicate-control anti-pattern diagram

## Knowledge Check
1. What's the cost of creating a separate control per framework instead of mapping one control across frameworks?
2. What does a `ControlMapping` record need to contain to be useful in an audit?

## Artifact Produced
Control Matrix (cross-framework mapping section) — see `docs/artifacts/` Control Matrix template.

## Visual Assets Required
- Cross-Framework Control Reuse Diagram
- Duplicate-Control Anti-Pattern Diagram

## Required Diagram
- Incident Lifecycle (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram/Table instead

## Required Table
- ISO ↔ NIST ↔ SOC 2 Crosswalk (see `FRAMEWORK_MAP_LIBRARY.md`)

## Required Visual Exercise
- Map CloudPay's single encryption control onto the ISO ↔ NIST ↔ SOC 2 Crosswalk to show it satisfies all three frameworks at once, then identify where in the Incident Lifecycle a failure of that control would first be detected.
