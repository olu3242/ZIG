# 01_BCM_DR_FOUNDATIONS

## Objectives
- Distinguish business continuity (keeping the business running) from disaster recovery (restoring IT systems).
- Explain how `ScenarioService` models a disruption event.
- Identify which assets need continuity plans first, based on criticality.

## Business Context
BCM/DR is often treated as an IT-only concern — this lesson reframes it as a governance
discipline grounded in the same asset-criticality data used elsewhere in Zig.

## Scenario Mapping
ManufacturX (`docs/scenarios/MANUFACTURX.md`) — no tested DR plan despite high-criticality
OT assets.

## Framework Mapping
Trains on `ScenarioService` (`Scenario`/`ScenarioRun`) and `Asset.criticality`.

## Diagram Requirements
- BCM vs. DR scope diagram
- Asset-criticality-to-continuity-priority diagram

## Knowledge Check
1. What's the difference between business continuity and disaster recovery in scope?
2. Why should asset criticality, not just IT complexity, drive continuity planning priority?

## Artifact Produced
None (foundational); first BIA appears in 02_BUSINESS_IMPACT_ANALYSIS.

## Visual Assets Required
- BCM-vs-DR Scope Diagram
- Asset-Criticality-to-Continuity-Priority Diagram

## Required Diagram
- Dependency Map (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram instead

## Required Table
- Not applicable for this lesson — no indexed table entry exists yet for BCM-vs-DR scope content; see Required Diagram instead

## Required Visual Exercise
- Using the Dependency Map for ManufacturX's OT assets, rank which assets need a continuity plan first based on criticality and upstream/downstream dependency count.
