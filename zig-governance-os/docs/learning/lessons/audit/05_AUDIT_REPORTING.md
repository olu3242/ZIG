# 05_AUDIT_REPORTING

## Objectives
- Assemble a complete audit report: scope, methodology, findings, corrective actions, conclusion.
- Write an executive summary distinct from the detailed findings section.
- Close an audit and link its outcome back into the governance score.

## Business Context
This closes the Audit track by producing the artifact every prior lesson fed into, and
ties audit closure back to the governance score's `assessmentCompletion` input.

## Scenario Mapping
HealthBridge (`docs/scenarios/HEALTHBRIDGE.md`) — finalize its internal audit report ahead
of the external HIPAA assessment.

## Framework Mapping
Trains on `Audit.endsAt` (closure) and how audit outcomes roll up into
`GovernanceScore.assessmentCompletion`.

## Diagram Requirements
- Audit report structure diagram
- Audit-closure-to-governance-score linkage diagram

## Knowledge Check
1. What's the difference between an audit report's executive summary and its findings section?
2. How does closing an audit affect the governance score's `assessmentCompletion` input?

## Artifact Produced
Audit Report (final) — see `docs/artifacts/` Audit Report template.

## Visual Assets Required
- Audit Report Structure Diagram
- Audit-Closure-to-Governance-Score Linkage Diagram

## Required Diagram
- Audit Lifecycle (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram/Table instead

## Required Table
- Audit Timeline (see `TABLE_LIBRARY.md`)

## Required Visual Exercise
- Assemble HealthBridge's final audit report by walking the Audit Lifecycle diagram from "Report" through "Remediate," using the Audit Timeline to show actual vs. planned milestones, and explain how closure updates `GovernanceScore.assessmentCompletion`.
