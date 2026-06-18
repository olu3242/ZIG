# Program MVP Definition

## Purpose

This is the PMO-level MVP definition for first paying customers.

## MVP User Journey

```text
Create Tenant
  -> Create Project
  -> Select Framework
  -> Manage Controls
  -> Upload Evidence
  -> Run Assessment
  -> View Governance Score
  -> Generate Report
```

## Required Platform Capabilities

- Tenant isolation
- Authentication and authorization
- Persona-aware experience
- Core data platform
- Repository and service layer
- Governance Graph
- Knowledge Graph
- Workflow OS
- Runtime OS
- Automation Platform
- Control management
- Evidence management
- Assessment and audit
- Governance score
- Mission Control
- Executive dashboard/analytics

## MVP Exclusions

The MVP does not require:

- Marketplace
- Global certification platform
- Governance network
- Trust graph
- Autonomous Governance Cloud
- Mobile app
- Multi-language platform

## MVP Acceptance Criteria

- No blank screens in the MVP journey.
- No orphan records.
- Every mutation is tenant-scoped and auditable.
- Every recommendation is explainable.
- Every report is traceable to source records.
- Build, lint, typecheck, and relevant migration validation pass.

## MVP Release Decision

MVP is releasable when Track 1 exit criteria are satisfied and release gates in `docs/execution/RELEASE_GATES.md` pass.
