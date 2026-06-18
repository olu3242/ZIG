# Release Gates

## Purpose

Release gates protect Zig from shipping incomplete, insecure, or incoherent platform increments.

## Gate 1: Documentation

Required:

- Relevant source docs reviewed.
- Required new docs created.
- `npm run docs:lint` passes or documented stubs are unrelated to current scope.

Blockers:

- Missing architecture documentation for implemented concepts.
- Prompt conflicts unresolved.

## Gate 2: Architecture

Required:

- Work maps to PRD, domain model, architecture, and Governance Graph.
- Package boundaries are respected.
- ADR created for material decisions.

Blockers:

- New module not documented in PRD.
- Alternative architecture introduced without ADR.

## Gate 3: Security

Required:

- Tenant isolation preserved.
- RBAC/permissions respected where applicable.
- Secrets are not committed.
- Data changes are auditable.

Blockers:

- Any cross-tenant access path.
- Any unaudited privileged mutation.

## Gate 4: Quality

Required:

- Strict TypeScript passes.
- Relevant lint/build/typecheck commands pass.
- Tests or compile-time validation exist for new packages.

Blockers:

- Known compile errors.
- Validation skipped without documented reason.

## Gate 5: UX

Required:

- No blank screens.
- Loading and error states exist for App Router routes.
- User has clear next action.

Blockers:

- Dead-end workflow.
- Empty module screen with no guidance or demo data.

## Gate 6: Release

Required:

- Implementation report exists.
- Open issues and future dependencies listed.
- Batch committed.

Blockers:

- Uncommitted intended changes.
- Generated or unrelated files staged.
