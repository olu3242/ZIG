# Architecture Decision Records

## Purpose

Architecture Decision Records (ADRs) preserve the reasoning behind Zig platform decisions so future batches do not reinterpret the architecture differently. Every material architecture change must add or update an ADR before implementation.

## ADR Format

Each ADR must include:

- Title
- Status: `Proposed`, `Accepted`, `Superseded`, or `Rejected`
- Date
- Context
- Decision
- Consequences
- Alternatives considered
- Documentation links
- Implementation links

## Required ADR Triggers

Create an ADR when a batch:

- Adds or changes persistence boundaries
- Changes tenant isolation behavior
- Changes authentication, authorization, or RBAC behavior
- Adds a new package or cross-package dependency
- Introduces a new engine or service layer pattern
- Changes the Governance Graph relationship model
- Introduces AI, automation, or agent behavior
- Changes scoring, readiness, certification, or reporting calculations
- Adds external integrations
- Changes deployment, hosting, or security posture

## Current Accepted Decisions

| ADR | Decision | Source |
|---|---|---|
| ADR-001 | Documentation is the source of truth before implementation | `CLAUDE.md` |
| ADR-002 | Every operational record is tenant-scoped | `CLAUDE.md`, `docs/convergence/governance-graph.md` |
| ADR-003 | Frameworks are metadata, not modules | `CLAUDE.md`, `docs/product/prd.md` |
| ADR-004 | Zig uses a Governance Graph as the convergence model | `docs/convergence/governance-graph.md` |
| ADR-005 | Core data access goes through repository and service layers | `docs/architecture/DATA_ACCESS_LAYER.md`, `docs/architecture/SERVICE_LAYER.md` |

## ADR File Convention

When ADRs become numerous, split this register into:

```text
docs/execution/adrs/
├── 0001-documentation-first.md
├── 0002-tenant-isolation.md
└── ...
```

Until then, record decisions here under the accepted decisions table.

## Review Rule

Before starting each batch, read all accepted ADRs and confirm the batch does not contradict them. If it does, create a new ADR that explicitly supersedes the older decision.
