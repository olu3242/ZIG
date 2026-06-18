# Technical Debt Register

## Purpose

This register tracks known compromises and deferred work so they are visible, intentional, and prioritized.

## Debt States

- `Open`
- `Accepted`
- `In Progress`
- `Resolved`

## Debt Severity

- `Critical`: security, tenant isolation, data loss, production blocker
- `High`: blocks core workflow or future batch
- `Medium`: slows development or weakens maintainability
- `Low`: cleanup or polish

## Current Debt

| ID | Severity | State | Area | Description | Resolution Path |
|---|---|---|---|---|---|
| TD-001 | High | Open | Docs | Several required docs remain stubs from the original Documentation OS. | Fill before implementing the phase that depends on each doc. |
| TD-002 | Medium | Open | Repo Hygiene | `node_modules` contains tracked workspace mirror paths, causing duplicate Git status entries. | Normalize ignore/tracking strategy in production hardening. |
| TD-003 | Medium | Open | Data Access | Batch 21 has in-memory adapter but no production Supabase adapter yet. | Implement after Batch 22 session and tenant context exists. |
| TD-004 | Medium | Open | Testing | Repo lacks a standardized runtime test runner for packages. | Choose and configure test runner before broad engine implementation. |
| TD-005 | Low | Open | Workspace | Generated `node_modules/@zig/` links remain untracked after workspace installs. | Ignore or clean via repo hygiene task. |

## Register Rules

- Do not hide known debt in implementation reports only.
- Add debt when accepting a workaround.
- Resolve debt with a commit that references the ID.
- Critical debt blocks release.

## Review Cadence

Review this register:

- Before every release train milestone
- Before production hardening
- Before v1 certification
