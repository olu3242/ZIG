# Zig Dependency Map

## Purpose

This dependency map controls sequencing. It prevents implementation from jumping ahead of required data, identity, graph, workflow, runtime, and experience foundations.

## Critical Path

```text
Execution Governance
  -> 21A Database Foundation
  -> 21B Repository & Service Layer
  -> 22 Identity Platform
  -> 22A Persona Engine
  -> 22B Platform Owner OS
  -> 22C Experience Orchestration
  -> 23 Governance Graph
  -> 23A Knowledge Graph
  -> 23B Data Fabric
  -> 24A Workflow OS
  -> 24K Runtime OS
  -> 24L Automation Platform
  -> Governance Engines
  -> Mission Control
  -> Analytics / Executive Cockpit
```

## Dependency Table

| Capability | Depends On | Blocks |
|---|---|---|
| Identity Platform | Core Data Platform | RBAC, tenant onboarding, persona experiences |
| Persona Engine | Identity Platform | role-based navigation, dashboards, AI experiences |
| Platform Owner OS | Identity, Analytics, Billing, Runtime | internal SaaS operations |
| Experience Orchestration | Persona Engine, RBAC | all differentiated user experiences |
| Governance Graph | Data Platform, Identity | traceability, impact, graph navigation |
| Knowledge Graph | Governance Graph, Framework Engine | AI reasoning, learning mapping, semantic search |
| Data Fabric | Data Platform, Integrations | lineage, quality, data catalog, cross-system mapping |
| Workflow OS | Identity, Data, Graph | approvals, escalations, evidence workflows |
| Runtime OS | Workflow OS, Automation Platform | jobs, queues, agents, execution monitoring |
| Automation Platform | Workflow OS, Runtime OS | rule execution and remediation workflows |
| Control Engine | Frameworks, Workflow OS, Graph | Evidence, Audit, Score |
| Evidence Engine | Control Engine, Document Management, Workflow OS | Audit, Score, Reporting |
| Audit Engine | Evidence, Assessments, Issue Management | Reports, Certification |
| Governance Score | Graph, Controls, Evidence, Assessments | Mission Control, Executive Cockpit |
| Mission Control | Score, Workflow, Analytics | MVP operating center |
| AI Coach | Knowledge Graph, RBAC, Governance Graph | AI recommendations |
| AI Command | Runtime OS, Workflow OS, Agents | autonomous operations |
| Marketplace | Content OS, Billing, Platform Owner OS | ecosystem |

## Dependency Rule

If a batch depends on a missing layer, document the missing layer first and either implement the dependency or explicitly defer the blocked behavior.
