# Platform Certification Checklist

## Purpose

This checklist is used before major release milestones and v1 certification. It verifies Zig is becoming a cohesive Governance Operating System, not a pile of modules.

## Architecture

- [ ] PRD, architecture, domain model, and convergence docs are aligned.
- [ ] All modules connect to the Governance Graph.
- [ ] No orphan operational records exist.
- [ ] Frameworks remain metadata, not separate modules.
- [ ] ADRs exist for material decisions.

## Data

- [ ] Core tables exist.
- [ ] Every tenant-scoped table has `tenant_id`.
- [ ] RLS is enabled and validated.
- [ ] Repository layer enforces tenant context.
- [ ] Service layer uses typed contracts.
- [ ] Audit events are generated for material mutations.

## Identity And Access

- [ ] Authentication is implemented.
- [ ] Tenant onboarding is implemented.
- [ ] RBAC is implemented.
- [ ] Permission matrix is documented.
- [ ] Role changes are audited.
- [ ] Sessions carry tenant context.

## Governance Workflows

- [ ] Project Builder works.
- [ ] Asset -> Risk -> Control -> Evidence -> Task chain works.
- [ ] Assessments and audits are linked.
- [ ] Governance Score is explainable.
- [ ] Recommendations are actionable and traceable.

## Learning And Simulation

- [ ] Learning paths connect to governance gaps.
- [ ] Scenario Lab produces scored outcomes.
- [ ] Certifications have evidence-backed requirements.
- [ ] Career progress maps to skills and artifacts.

## AI And Automation

- [ ] AI Coach uses tenant/project context.
- [ ] AI Command routes through approval workflows.
- [ ] Agent actions are auditable.
- [ ] AI outputs include reason, confidence, and supporting data.
- [ ] AI cannot bypass RBAC.

## UX

- [ ] No blank states.
- [ ] Primary flows have loading and error states.
- [ ] Dashboards show operational data.
- [ ] Accessibility checks pass for primary flows.
- [ ] Mobile layouts are usable.

## Release

- [ ] Build passes.
- [ ] Lint passes.
- [ ] Package typechecks pass.
- [ ] Tests pass or documented blockers exist.
- [ ] Implementation reports are complete.
- [ ] Technical debt register is reviewed.
- [ ] Security baseline is met.

## Certification Result

Certification status:

- `Not Ready`
- `Ready With Exceptions`
- `Certified`

`Certified` requires no critical findings in tenant isolation, security, data integrity, graph integrity, or primary workflows.
