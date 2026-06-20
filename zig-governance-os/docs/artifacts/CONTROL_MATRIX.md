# Artifact: Control Matrix

## Purpose
Maps controls to the risks they mitigate and the frameworks they satisfy. The artifact
that proves a control's cross-framework reuse rather than re-implementing a control per
framework.

## Backing Data
`ControlService` (`packages/services/src/ControlService.ts`, extends
`BaseService<ControlRecord>`) and `ControlService.findMappings` / `ControlMapping` — real,
exist on `main`.

## Structure
- Control name, description, owner, lifecycle status
- Linked risk(s)
- Cross-framework mapping (e.g. ISO 27001 Annex A reference + SOC 2 Trust Services
  Criteria reference) with rationale for each
- Implementation evidence reference

## Track
Security Governance, Compliance

## Lesson
`docs/learning/lessons/security_governance/02_*` through `04_*`,
`docs/learning/lessons/compliance/*`

## Lab
`docs/learning/labs/SECURITY_GOVERNANCE_LAB_DESIGN_CROSS_FRAMEWORK_CONTROLS.md`

## Skill
Designing one control that satisfies multiple frameworks with a defensible rationale.

## Career Outcome
Can produce an audit-ready control matrix without supervision.
