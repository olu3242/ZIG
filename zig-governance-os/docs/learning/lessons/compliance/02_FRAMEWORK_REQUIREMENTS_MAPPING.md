# 02_FRAMEWORK_REQUIREMENTS_MAPPING

## Objectives
- Read a framework requirement (e.g. an ISO 27001 Annex A clause) and identify what evidence would satisfy it.
- Map one organizational capability to multiple framework requirements.
- Identify requirements with no current control coverage.

## Business Context
Frameworks describe outcomes, not implementations — this lesson trains learners to read a
requirement and translate it into something a real control can satisfy.

## Scenario Mapping
CloudPay (`docs/scenarios/CLOUDPAY.md`) — map its "Encryption at Rest" control against
relevant ISO 27001 and SOC 2 requirements.

## Framework Mapping
Trains on `Framework` records and `Control.frameworkId`.

## Diagram Requirements
- Requirement-to-control coverage matrix
- Gap highlighting diagram (uncovered requirements)

## Knowledge Check
1. What does it mean for a framework requirement to have zero control coverage?
2. How can one control satisfy requirements in two different frameworks?

## Artifact Produced
Control Matrix (requirement-coverage columns) — see `docs/artifacts/` Control Matrix template.

## Visual Assets Required
- Requirement-to-Control Coverage Matrix
- Gap Highlighting Diagram

## Required Diagram
- Control Lifecycle (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram/Table instead

## Required Table
- ISO ↔ NIST ↔ SOC 2 Crosswalk (see `FRAMEWORK_MAP_LIBRARY.md`)

## Required Visual Exercise
- Locate CloudPay's "Encryption at Rest" control on the ISO ↔ NIST ↔ SOC 2 Crosswalk and identify any requirement row where it has zero coverage, then trace where in the Control Lifecycle that gap would surface.
