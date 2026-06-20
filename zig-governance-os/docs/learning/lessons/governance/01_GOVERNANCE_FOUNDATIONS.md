# 01_GOVERNANCE_FOUNDATIONS

## Objectives
- Explain the Universal Governance Model chain: Organization → Project → Asset → Risk → Control → Framework Requirement → Evidence → Task → Report.
- Identify which entity in that chain a given governance question belongs to.
- State why Zig treats frameworks as metadata rather than separate modules.

## Business Context
Most governance failures trace back to disconnected data: a risk with no asset, a control
with no evidence, a report with no underlying score. This lesson establishes the chain
every later lesson assumes, so learners stop treating governance as a checklist and start
treating it as a connected data model.

## Scenario Mapping
GovSec (`docs/scenarios/GOVSEC.md`) — a mid-maturity org with real assets, controls, and
an unreported governance score, used to walk the chain end to end with concrete records.

## Framework Mapping
Framework-agnostic; trains on `GovernanceService` and the core entity types in
`packages/types/src/index.ts` (`Project`, `Asset`, `Risk`, `Control`, `Evidence`, `Task`).

## Diagram Requirements
- Universal Governance Model chain diagram (9-node flow, left to right)
- "Frameworks as metadata" overlay diagram showing one control tagged with 3 frameworks

## Knowledge Check
1. In the Universal Governance Model, what must exist before a Risk can be created?
2. Why does ISO 27001 attach to a Control as metadata instead of having its own table?

## Artifact Produced
None (foundational lesson; first artifact appears in 02_GOVERNANCE_STRUCTURES).

## Visual Assets Required
- Governance Model Chain Diagram
- Framework-as-Metadata Overlay Diagram

## Required Diagram
- Governance Hierarchy (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram/Table instead

## Required Table
- Not applicable for this lesson — no indexed table entry exists yet for foundational chain content; see Required Diagram instead

## Required Visual Exercise
- Using the Governance Hierarchy diagram, trace GovSec's reporting line from a frontline control owner up to the Board and identify which entity in the Universal Governance Model chain each layer corresponds to.
