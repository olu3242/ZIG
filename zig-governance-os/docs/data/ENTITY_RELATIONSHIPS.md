# Entity Relationships

## Purpose

This document describes the Batch 21A database relationships that support the vertical slice MVP.

## Tenant Boundary

Every table is tenant-scoped with `tenant_id`.

```text
tenant
  -> users
  -> roles
  -> permissions
  -> projects
  -> frameworks
  -> audit_events
```

The `tenants` table mirrors `id` into `tenant_id` so repository and RLS conventions stay consistent across all persisted records.

## MVP Governance Spine

```text
Tenant
  -> Project
  -> Asset
  -> Risk
  -> Control
  -> Evidence
  -> Task
```

This spine is the minimum viable operating model for Zig.

## Core Relationships

| Relationship | Database Constraint |
|---|---|
| User belongs to Tenant | `users.tenant_id -> tenants.id` |
| Role belongs to Tenant | `roles.tenant_id -> tenants.id` |
| Permission belongs to Tenant | `permissions.tenant_id -> tenants.id` |
| Project belongs to Tenant | `projects.tenant_id -> tenants.id` |
| Project selects Framework | `projects.framework_id -> frameworks.id` |
| Framework belongs to Tenant | `frameworks.tenant_id -> tenants.id` |
| Control belongs to Project and Framework | `controls.project_id`, `controls.framework_id` |
| Asset belongs to Project | `assets.project_id -> projects.id` |
| Risk belongs to Asset and Project | `risks.asset_id`, `risks.project_id` |
| RiskAssessment belongs to Risk | `risk_assessments.risk_id -> risks.id` |
| Evidence belongs to Control and Project | `evidence.control_id`, `evidence.project_id` |
| Task belongs to Project | `tasks.project_id -> projects.id` |
| Audit belongs to Project and Framework | `audits.project_id`, `audits.framework_id` |
| Assessment belongs to Project and optional Framework | `assessments.project_id`, `assessments.framework_id` |
| LearningModule belongs to LearningPath | `learning_modules.learning_path_id` |
| ScenarioRun belongs to Scenario | `scenario_runs.scenario_id` |
| GovernanceScore belongs to Project | `governance_scores.project_id` |
| Recommendation belongs to Project | `recommendations.project_id` |
| AuditEvent belongs to Tenant and references an entity | `audit_events.tenant_id`, `entity_table`, `entity_id` |

## Read Models

Batch 21A adds deployable views:

- `project_governance_summary`
- `tenant_audit_activity`

These views are read models only. They do not replace source tables or graph relationships.

## Deferred Relationships

Batch 23 will add the Governance Graph relationship model for traceability beyond direct table foreign keys.

Deferred examples:

- Risk -> Control
- Control -> Evidence Requirement
- Evidence -> Audit Finding
- Assessment -> Governance Score
- Governance Score -> Recommendation
