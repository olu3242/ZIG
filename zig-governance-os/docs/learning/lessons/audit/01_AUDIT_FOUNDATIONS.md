# 01_AUDIT_FOUNDATIONS

## Objectives
- Distinguish internal audit from external/certification audit.
- Explain the audit trail model behind `AuditService.recordAction`.
- Identify what makes an audit finding defensible vs. anecdotal.

## Business Context
Every action in Zig is auditable by design — this lesson grounds learners in that trail
before they plan or execute an audit against it.

## Scenario Mapping
HealthBridge (`docs/scenarios/HEALTHBRIDGE.md`) — its incomplete PHI access logging is a
direct audit-trail gap.

## Framework Mapping
Trains on `AuditService.recordAction` and the `Audit` record (`startsAt`/`endsAt`,
`frameworkId`).

## Diagram Requirements
- Audit Lifecycle Diagram (plan → fieldwork → findings → report → closure)
- Audit trail data flow diagram

## Knowledge Check
1. What's the difference between an internal audit and a certification audit?
2. Why is an audit trail with gaps (like HealthBridge's) itself a finding?

## Artifact Produced
None (foundational); first Audit Plan appears in 02_AUDIT_PLANNING_SCOPING.

## Visual Assets Required
- Audit Lifecycle Diagram
- Audit Trail Data Flow Diagram
