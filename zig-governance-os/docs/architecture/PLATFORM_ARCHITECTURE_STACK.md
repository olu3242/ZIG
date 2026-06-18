# Platform Architecture Stack

## Purpose

This document defines the final Zig platform-layer stack after the gap closure analysis. It is the architecture guardrail for implementation sequencing and package boundaries.

## Stack

| Layer | Name | Responsibility |
|---|---|---|
| 1 | Identity Platform | authentication, authorization, tenant onboarding, sessions, roles, permissions |
| 2 | Core Data Platform | PostgreSQL/Supabase schema, repositories, services, audit events, tenant isolation |
| 3 | Governance Graph | operational entity relationships, traceability, impact analysis, coverage |
| 4 | Knowledge Graph | semantic framework, governance, learning, scenario, AI, certification knowledge |
| 5 | Workflow OS | workflow definitions, approvals, escalations, runs, steps |
| 6 | Automation Platform | rules, triggers, conditions, actions, scheduled automations |
| 7 | Runtime OS | event bus, job scheduler, queues, retries, agent execution, workflow execution |
| 8 | Governance Engines | assets, risks, controls, evidence, audits, learning, scenarios |
| 9 | AI Platform | AI Coach, agents, command center, approvals, explainable generation |
| 10 | Analytics Platform | dashboards, predictions, benchmarks, executive cockpits |
| 11 | Mission Control | operating center for alerts, tasks, score, recommendations, approvals |
| 12 | Governance Cloud | marketplace, network, exchange, trust graph, enterprise API ecosystem |

## Platform Layer Packages

| Package | Layer | Status |
|---|---|---|
| `packages/types` | shared contracts | started |
| `packages/data-access` | core data platform | started |
| `packages/services` | service layer | started |
| `packages/governance-engine` | scoring and RBAC | started |
| `packages/framework-engine` | framework metadata | started |
| `packages/knowledge-graph` | knowledge graph | planned |
| `packages/workflow-engine` | Workflow OS | planned |
| `packages/automation-platform` | automation platform | planned |
| `packages/runtime-os` | runtime platform | planned |
| `packages/analytics-platform` | analytics platform | planned |
| `packages/policy-engine` | policy lifecycle | planned |
| `packages/integration-hub` | integrations | planned |

## Runtime Flow

```text
User Action
  -> Event Bus
  -> Runtime Engine
  -> Workflow Engine
  -> Automation Rules
  -> AI Agents
  -> Repository / Service Layer
  -> Governance Graph
  -> Analytics / Mission Control
```

## Knowledge Flow

```text
Framework Requirement
  -> Universal Control
  -> Evidence Requirement
  -> Learning Module
  -> Scenario
  -> Assessment
  -> Audit Program
  -> Certification Readiness
  -> AI Recommendation
```

## Architecture Rules

- Runtime OS executes work; it does not own business domain records.
- Workflow OS defines and tracks workflows; Automation Platform defines reusable rules and triggers.
- Knowledge Graph stores semantic relationships; Governance Graph stores operational relationships.
- Analytics Platform reads governed data; Mission Control turns analytics into operational actions.
- AI Platform must use Knowledge Graph context and write through approval-controlled workflows.
- Every layer must preserve tenant isolation, auditability, and traceability.

## Acceptance Criteria

- Every platform layer has a documented purpose and package boundary.
- Future batches map to one or more layers without duplicating responsibilities.
- No implementation bypasses the service/data-access layer for persisted records.
- No AI, runtime, or automation capability writes official state without auditability.
