# 04_CONTINUITY_PLAN_DESIGN

## Objectives
- Design a continuity plan that meets a target asset's RTO/RPO.
- Assign roles and a communication plan for a disruption event.
- Identify single points of failure the plan must specifically address.

## Business Context
This is where BIA and RTO/RPO targets (Lessons 02-03) become an actual operational plan,
not just numbers on a page.

## Scenario Mapping
ManufacturX (`docs/scenarios/MANUFACTURX.md`) — design a continuity plan addressing its
flat OT/IT network segmentation single point of failure.

## Framework Mapping
Trains on `ScenarioService` (`Scenario` as the plan's test harness) and `Task` assignment
for plan execution steps.

## Diagram Requirements
- Continuity plan structure diagram (roles, communication tree, recovery steps)
- Single-point-of-failure identification diagram

## Knowledge Check
1. What should a continuity plan's communication tree specify beyond "who to call"?
2. How do you identify a single point of failure the plan must address?

## Artifact Produced
None directly; plan is tested in 05_DISASTER_RECOVERY_TESTING.

## Visual Assets Required
- Continuity Plan Structure Diagram
- Single-Point-of-Failure Identification Diagram

## Required Diagram
- Not applicable for this lesson — see Required Workflow/Table instead

## Required Workflow
- Recovery Workflow (see `WORKFLOW_LIBRARY.md`)

## Required Table
- Crisis Escalation Chart (see `TABLE_LIBRARY.md`)
- Crisis Escalation Decision Tree (see `DECISION_TREE_LIBRARY.md`)

## Required Visual Exercise
- Design a continuity plan for ManufacturX's flat OT/IT network segmentation single point of failure by walking the Recovery Workflow end to end, then use the Crisis Escalation Chart and Crisis Escalation Decision Tree to assign notification authority by severity.
