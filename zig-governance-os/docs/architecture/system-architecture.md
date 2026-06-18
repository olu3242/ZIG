# System Architecture — Zig

## Overview

Zig is a multi-tenant web application built around one shared data model (the Universal
Governance Model) rather than separate modules per concern. A single set of core tables
(organizations, projects, assets, risks, controls, evidence, tasks, reports) is shared by
every module in the product surface; frameworks attach to those tables as metadata rather
than owning their own parallel set of tables.

See the standalone diagram at `architecture-diagram.svg` in this folder for the visual
version of the layered view below.

```
┌─────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Web)                            │
│   Mission Control · Project Builder · Asset/Risk/Control/Evidence/   │
│   Task Workspaces · Scenario Workspace · AI Command Center ·         │
│   Health Advisor · Executive Reporting                               │
└───────────────────────────────┬────────────────────────────────────┘
                                 │  authenticated, tenant-scoped requests
┌───────────────────────────────▼────────────────────────────────────┐
│                                API LAYER                             │
│   Auth & RBAC · Org/Project scoping middleware · REST/RPC endpoints  │
└───────┬───────────────┬───────────────┬───────────────┬────────────┘
        │               │               │               │
┌───────▼──────┐ ┌──────▼───────┐ ┌─────▼────────┐ ┌────▼───────────┐
│  Governance  │ │  Framework   │ │  AI Command   │ │ Health Advisor │
│  Scoring     │ │  Engine      │ │  Center       │ │ Engine         │
│  Engine      │ │ (mappings,   │ │ (program/risk/│ │ (continuous    │
│ (explainable │ │ coverage,    │ │ control gen,  │ │ gap detection, │
│  score)      │ │ readiness)   │ │ explainable)  │ │ remediation)   │
└───────┬──────┘ └──────┬───────┘ └─────┬─────────┘ └────┬───────────┘
        │               │               │                │
        └───────────────┴───────┬───────┴────────────────┘
                                 │
                  ┌──────────────▼──────────────┐
                  │      CORE DATA MODEL          │
                  │ Organization → Project →      │
                  │ Asset → Risk → Control →      │
                  │ Framework Requirement →       │
                  │ Evidence → Task → Report      │
                  │ (row-level tenant isolation)  │
                  └────────────────────────────────┘
```

## Layers

### Client
The 11 product modules render against the same core entities; there is no module that
owns its own private data shape. Every list/detail view reads and writes through the API
layer's tenant-scoped endpoints.

### API layer
Every request is resolved to an Organization and Project before it touches the core data
model. RBAC is enforced here for every one of the seven roles (Organization Admin, GRC
Manager, Risk Analyst, Compliance Analyst, Auditor, Consultant, Viewer). Consultants are
the one role permitted to operate against more than one organization in a session.

### Engines
Four engines sit beside the API layer and all read/write the same core data model rather
than maintaining separate stores:

- **Governance Scoring Engine** — computes the explainable score from coverage and
  completeness inputs (full formula: `governance-scoring-engine.md`).
- **Framework Engine** — owns the framework knowledge model and the mapping, coverage, and
  readiness calculations (full detail: `framework-engine.md`).
- **AI Command Center** — generates programs, risks, controls, mappings, and reports
  directly as core-model records, each with reason/confidence/framework-reference metadata
  (full detail: `ai-architecture.md`).
- **Health Advisor Engine** — runs continuously against the core model, not on a manual
  trigger, surfacing gaps as they appear (full detail: `health-advisor-engine.md`).

### Core data model
The Universal Governance Model. Every entity carries `organization_id` and `project_id`
for tenant isolation, enforced at the data layer (row-level security), not only in the API
or UI. Full schema: `../data/database-schema.md`. Full entity list: `../data/entities.md`.

## Design constraints that follow from this architecture

- A framework being added or updated should never require a code change in any of the 11
  modules — only new rows in the Framework Engine's knowledge model.
- The Governance Scoring Engine and Health Advisor Engine must be able to explain any
  output by tracing back through the core data model, never through an opaque internal
  state separate from it.
- Because all four engines share one data model, an action taken in any one module (e.g.
  uploading evidence in the Evidence Workspace) must be immediately visible to the others
  (the score updates, the Health Advisor re-evaluates, the Framework Engine's coverage
  recalculates) without a separate sync step.
