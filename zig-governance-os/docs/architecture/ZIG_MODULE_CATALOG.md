# Zig Module Catalog

## Purpose

The module catalog names every planned module and platform service so implementation teams do not invent duplicate surfaces.

## Customer-Facing Governance Modules

| Module | Purpose | Track |
|---|---|---|
| Mission Control | operating center for score, alerts, tasks, approvals | MVP |
| Project Builder | guided governance program creation | MVP |
| Asset Workspace | asset inventory and classification | MVP |
| Risk Workspace | risk identification, assessment, treatment | MVP |
| Control Workspace | control registry, lifecycle, testing | MVP |
| Evidence Workspace | evidence repository, review, approval | MVP |
| Task Workspace | assigned remediation and governance work | MVP |
| Assessment Workspace | self-assessments and readiness reviews | MVP |
| Audit Workspace | internal/external audits, findings, reports | MVP |
| Policy Management | policy lifecycle, attestation, exceptions | MVP closure |
| Vendor Risk | third-party registry, assessments, evidence | MVP closure |
| Incident Management | incident register, RCA, corrective actions | MVP closure |
| Issue Management | findings, CAPA, remediation closure | MVP closure |

## Learning And Certification Modules

| Module | Purpose |
|---|---|
| Learning OS | paths, courses, modules, labs, assessments |
| Scenario Lab | experiential governance scenarios |
| Practice Lab | realistic role-based exercises |
| Career Mode | portfolio, resume, readiness, career tracks |
| Governance University | programs, credentials, capstones |
| Certification Platform | readiness, issuance, verification, renewals |

## Platform Services

| Service | Package |
|---|---|
| Data Access | `packages/data-access` |
| Services | `packages/services` |
| Identity | TBD |
| Persona Engine | `packages/persona-engine` |
| Data Fabric | `packages/data-fabric` |
| Governance Graph | TBD |
| Knowledge Graph | `packages/knowledge-graph` |
| Workflow OS | `packages/workflow-engine` |
| Automation Platform | `packages/automation-platform` |
| Runtime OS | `packages/runtime-os` |
| API Platform | TBD |
| Integration Hub | `packages/integration-hub` |
| Observability | TBD |
| Billing | TBD |
| Platform Builder | `packages/platform-builder` |

## Internal Operations Modules

| Module | Purpose |
|---|---|
| Platform Owner OS | revenue, tenants, runtime, AI, content, releases |
| Platform Admin | support, content management, incident operations |
| Release Train System | versions, gates, environments, release certification |
| Quality OS | testing, regression, performance, accessibility, security |
| Customer Implementation OS | onboarding, migration, setup, training, go-live |
| Governance Content OS | templates, versioning, marketplace-ready content |

## Module Acceptance

Every module must satisfy `docs/execution/MODULE_ACCEPTANCE_CRITERIA.md`.
