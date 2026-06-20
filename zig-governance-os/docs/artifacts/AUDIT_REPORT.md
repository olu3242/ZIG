# Artifact: Audit Report

## Purpose
The output of an executed audit: findings, severity, evidence, and corrective action
owners. The artifact that closes the audit loop back into the Task Workspace.

## Backing Data
`AuditService` (`packages/services/src/AuditService.ts`) plus `EvidenceService`
(`packages/services/src/EvidenceService.ts`, extends `BaseService<EvidenceRecord>`) for
the evidence cited per finding — both real, exist on `main`.

## Structure
- Findings (description, severity, affected control/asset)
- Supporting evidence references
- Corrective action plan with owner and due date
- Overall audit conclusion

## Track
Audit

## Lesson
`docs/learning/lessons/audit/04_*`, `05_AUDIT_REPORTING.md`

## Lab
`docs/learning/labs/AUDIT_LAB_EXECUTE_INTERNAL_AUDIT.md`

## Skill
Writing findings that are specific, evidenced, and tied to an owned corrective action.

## Career Outcome
Can produce an audit report a client or board would accept without rework.
