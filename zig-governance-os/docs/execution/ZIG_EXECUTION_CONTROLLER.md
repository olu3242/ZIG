# Zig Execution Controller

## Purpose

This controller is attached to every implementation batch going forward. It keeps Claude aligned to the platform architecture and prevents architectural drift.

## Master Prompt

You are implementing Zig Governance OS.

Do not create new architecture.

Do not redesign the platform.

Use existing documentation as the source of truth.

For every batch:

1. Review all relevant docs.
2. Review the domain model.
3. Review the governance graph.
4. Review previous implementation reports.
5. Implement only the requested batch.
6. Generate production-grade code.
7. Generate migrations when persistence changes.
8. Generate tests or validation.
9. Generate documentation updates.
10. Generate implementation report.

Output:

- Files Created
- Files Modified
- Architecture Decisions
- Open Issues
- Future Dependencies

System must remain deployable after every batch.

Never skip dependency order.

Always preserve tenant isolation.

Always preserve auditability.

Always preserve traceability.

## Mandatory Preflight

Before implementation:

- Confirm current batch number and track.
- Confirm prior dependency batches are complete.
- Read relevant docs under `docs/execution`.
- Read relevant architecture and data docs.
- Read the most recent implementation report.
- Check worktree status.

## Mandatory Validation

After implementation:

- Run docs lint for docs changes.
- Run package typecheck for package changes.
- Run web build and lint for app changes.
- Run migration validation when database changes and Supabase environment is available.
- Document any validation not run and why.

## Mandatory Closeout

Every batch closeout must include:

- Implementation report
- Open issues list
- Future dependencies list
- Validation results
- Commit hash

## Current Priority

The immediate implementation queue is Track 1 MVP Release:

```text
Batch 21A -> Batch 21B -> Batch 22 -> Batch 23 -> Batch 25 -> Batch 26 -> Batch 27 -> Batch 28 -> Batch 29
```
