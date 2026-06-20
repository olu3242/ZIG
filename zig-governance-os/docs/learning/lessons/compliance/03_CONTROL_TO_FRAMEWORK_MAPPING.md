# 03_CONTROL_TO_FRAMEWORK_MAPPING

## Objectives
- Create a `ControlMapping` record linking one source control to a target framework's control.
- Write a mapping rationale that would survive an auditor's challenge.
- Identify when two frameworks' requirements are similar but not identical (false-equivalence risk).

## Business Context
Lazy 1:1 framework mapping is a common audit failure point — this lesson trains learners
to map carefully and document why a mapping holds, not just that it exists.

## Scenario Mapping
CloudPay (`docs/scenarios/CLOUDPAY.md`) — map its access-review control across ISO 27001
and SOC 2's overlapping-but-not-identical access control requirements.

## Framework Mapping
Trains on `ControlMapping.mappingRationale` and `ControlService.findMappings`.

## Diagram Requirements
- Control mapping rationale template diagram
- False-equivalence risk example (two similar-looking requirements that differ in scope)

## Knowledge Check
1. What must a `mappingRationale` contain to survive an auditor challenge?
2. Give an example of two frameworks' requirements that look identical but aren't.

## Artifact Produced
Control Matrix (cross-framework mapping section) — see `docs/artifacts/` Control Matrix template.

## Visual Assets Required
- Control Mapping Rationale Template Diagram
- False-Equivalence Risk Example Diagram
