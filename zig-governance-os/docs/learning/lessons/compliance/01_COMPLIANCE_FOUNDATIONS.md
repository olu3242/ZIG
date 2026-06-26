# 01_COMPLIANCE_FOUNDATIONS

## Objectives
- Explain why frameworks are metadata in Zig, not separate modules or code paths.
- Identify which entities (control, evidence, task) can carry framework metadata.
- Distinguish "compliant" from "control implemented" — compliance requires evidence too.

## Business Context
Many tools hardcode framework logic per-framework, creating duplicate workflows. This
lesson establishes the metadata model so learners understand why one control can satisfy
three frameworks at once.

## Scenario Mapping
CloudPay (`docs/scenarios/CLOUDPAY.md`) — pursuing both SOC 2 and ISO 27001 simultaneously.

## Framework Mapping
Trains on `Framework` and `ControlMapping` records; reinforces the hard rule against
framework-specific code paths.

## Diagram Requirements
- Frameworks-as-metadata model diagram
- "Implemented vs. compliant" distinction diagram

## Knowledge Check
1. Why is a control marked "implemented" but with no evidence not yet compliant?
2. What breaks if framework logic is hardcoded into a module instead of attached as metadata?

## Artifact Produced
None (foundational); first Control Matrix entry appears in 03_CONTROL_TO_FRAMEWORK_MAPPING.

## Visual Assets Required
- Frameworks-as-Metadata Model Diagram
- Implemented-vs-Compliant Distinction Diagram

## Required Diagram
- Control Lifecycle (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram/Table instead

## Required Table
- Framework Crosswalk Table (general) (see `FRAMEWORK_MAP_LIBRARY.md`)

## Required Visual Exercise
- Using the Framework Crosswalk Table, place CloudPay's SOC 2 and ISO 27001 control families side by side and identify one control that could satisfy requirements in both, then trace it through the Control Lifecycle to show where evidence makes it "compliant" rather than merely "implemented."
