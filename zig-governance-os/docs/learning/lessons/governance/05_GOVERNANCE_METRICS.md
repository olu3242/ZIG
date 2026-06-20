# 05_GOVERNANCE_METRICS

## Objectives
- Decompose a governance score into its four explainable inputs.
- Identify which metric to improve first for the fastest score gain.
- Explain a governance score to a non-technical stakeholder without losing accuracy.

## Business Context
`GovernanceService` is explicit that every score must say why it is what it is — this
lesson trains learners to read and act on that explanation, not just the headline number.

## Scenario Mapping
GovSec (`docs/scenarios/GOVSEC.md`) — decompose its governance score and propose the
single highest-leverage improvement.

## Framework Mapping
Trains directly on `GovernanceScore` fields: `controlsImplemented`, `evidenceCoverage`,
`riskTreatment`, `assessmentCompletion`, `explanation`.

## Diagram Requirements
- Governance score decomposition diagram (4-input breakdown)
- Score-improvement priority matrix (impact vs. effort)

## Knowledge Check
1. If `evidenceCoverage` is the lowest of the four inputs, what's the first action to take?
2. Why must every governance score include an `explanation` field rather than just a number?

## Artifact Produced
Board Report draft (score decomposition section) — see `docs/artifacts/` Board Report template.

## Visual Assets Required
- Governance Score Decomposition Diagram
- Score Improvement Priority Matrix

## Required Diagram
- Governance Dashboard (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram/Table instead

## Required Table
- Not applicable for this lesson — no indexed table entry exists yet for score-decomposition content; see Required Diagram instead

## Required Visual Exercise
- Using the Governance Dashboard diagram, identify which of GovSec's four score inputs (controlsImplemented, evidenceCoverage, riskTreatment, assessmentCompletion) is lowest and propose the single highest-leverage action to raise it.
