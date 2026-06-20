# 04_COMPLIANCE_GAP_ANALYSIS

## Objectives
- Identify framework requirements with no covering control or missing evidence.
- Prioritize gaps by audit risk and remediation cost.
- Produce a gap closure plan with owners and target dates.

## Business Context
Gap analysis is where compliance work becomes actionable — this lesson turns a coverage
matrix (Lesson 02-03) into a prioritized backlog.

## Scenario Mapping
RetailNova (`docs/scenarios/RETAILNOVA.md`) — its unscoped PCI DSS boundary is a
foundational gap blocking everything downstream.

## Framework Mapping
Trains on `Control.status = "needs_evidence"` filtering and `EvidenceService` (missing
evidence as a gap signal).

## Diagram Requirements
- Gap prioritization matrix (audit risk vs. remediation cost)
- Gap closure plan timeline

## Knowledge Check
1. Why does an unscoped compliance boundary (like RetailNova's PCI DSS scope) block every other gap-closure effort?
2. What two factors should drive gap prioritization?

## Artifact Produced
Compliance gap closure plan section of the Control Matrix — see `docs/artifacts/` Control Matrix template.

## Visual Assets Required
- Gap Prioritization Matrix
- Gap Closure Plan Timeline
