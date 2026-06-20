# 05_COMPLIANCE_REPORTING

## Objectives
- Build a compliance status report by framework, sourced from real control/evidence data.
- Distinguish a compliance report from a governance score report (different audiences, overlapping data).
- Present compliance status to an auditor vs. to an executive differently.

## Business Context
This closes the Compliance track by turning mapped, gap-prioritized data into a
stakeholder-ready report — the same underlying data, two different presentations.

## Scenario Mapping
RetailNova (`docs/scenarios/RETAILNOVA.md`) — report its PCI DSS and SOC 2 status after
the gap-closure plan from Lesson 04 is partially executed.

## Framework Mapping
Trains on `Control.status` aggregation by `frameworkId`, distinct from
`GovernanceService` score reporting.

## Diagram Requirements
- Compliance status report layout (by framework)
- Auditor-view vs. executive-view comparison diagram

## Knowledge Check
1. What's the key difference between a compliance status report and a governance score report?
2. What does an auditor need in a compliance report that an executive does not?

## Artifact Produced
Compliance status section feeding into the Board Report — see `docs/artifacts/` Board Report template.

## Visual Assets Required
- Compliance Status Report Layout
- Auditor-View vs. Executive-View Comparison Diagram
