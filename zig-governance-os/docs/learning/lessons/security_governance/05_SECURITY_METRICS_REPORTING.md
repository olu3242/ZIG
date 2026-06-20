# 05_SECURITY_METRICS_REPORTING

## Objectives
- Report control implementation rate and evidence coverage by framework.
- Connect control metrics to the governance score's `controlsImplemented` input.
- Present security control posture to both a security team and an executive audience.

## Business Context
This closes the Security Governance track by turning the control work from Lessons 02-04
into reportable metrics that feed the governance score.

## Scenario Mapping
CloudPay (`docs/scenarios/CLOUDPAY.md`) — report its control posture ahead of its SOC 2
Type II audit.

## Framework Mapping
Trains on `GovernanceScore.controlsImplemented` and per-framework control status rollups.

## Diagram Requirements
- Control posture metrics dashboard mockup
- Security-team-view vs. executive-view comparison diagram

## Knowledge Check
1. How does control implementation rate feed into the governance score?
2. What's different about presenting control posture to a security team vs. an executive?

## Artifact Produced
Board Report (security control posture section) — see `docs/artifacts/` Board Report template.

## Visual Assets Required
- Control Posture Metrics Dashboard Mockup
- Security-Team-View vs. Executive-View Comparison Diagram

## Required Diagram
- Governance Dashboard (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram/Table instead

## Required Table
- Control Coverage Matrix (see `FRAMEWORK_MAP_LIBRARY.md`)

## Required Visual Exercise
- Build CloudPay's control posture report by reading control-implementation rates off the Governance Dashboard and cross-referencing the Control Coverage Matrix, then produce two summaries of the same data for a security-team audience and an executive audience ahead of its SOC 2 Type II audit.
