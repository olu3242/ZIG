# 02_CONTROL_DESIGN_PRINCIPLES

## Objectives
- Design a control that is specific, testable, and assignable to a single owner.
- Avoid writing controls that just restate a framework requirement verbatim.
- Tie a control to the asset(s) and risk(s) it actually mitigates.

## Business Context
Vague controls ("ensure security") can't be tested or evidenced — this lesson trains
control statements precise enough for the Evidence Workspace to actually work against.

## Scenario Mapping
CloudPay (`docs/scenarios/CLOUDPAY.md`) — design its "Access Review Quarterly" control properly.

## Framework Mapping
Trains on `Control.title`/`description` quality and the `Control`-to-`Risk` link.

## Diagram Requirements
- Control statement quality checklist (good vs. bad example)
- Control-to-risk-to-asset linkage diagram

## Knowledge Check
1. What makes a control "testable" rather than aspirational?
2. Why should a control be traceable to a specific risk it mitigates?

## Artifact Produced
Control Matrix (initial entries) — see `docs/artifacts/` Control Matrix template.

## Visual Assets Required
- Control Statement Quality Checklist
- Control-to-Risk-to-Asset Linkage Diagram

## Required Diagram
- Threat Flow (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Vulnerability Management Workflow (see `WORKFLOW_LIBRARY.md`)

## Required Table
- MITRE Mapping Table (see `TABLE_LIBRARY.md`)
- Control Coverage Matrix (see `FRAMEWORK_MAP_LIBRARY.md`)

## Required Visual Exercise
- Trace a threat against CloudPay's "Access Review Quarterly" control through the Threat Flow diagram, locate the matching technique on the MITRE Mapping Table, and confirm the control's testability by walking it through the Vulnerability Management Workflow.
