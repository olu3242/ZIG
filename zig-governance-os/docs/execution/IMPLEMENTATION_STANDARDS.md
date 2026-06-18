# Implementation Standards

## Purpose

These standards define how every Zig batch is executed. They prevent inconsistent implementation styles, incomplete deliverables, and architecture drift.

## Execution Controller

Every implementation batch must follow `docs/execution/ZIG_EXECUTION_CONTROLLER.md`.

The active execution plan is `docs/execution/EXECUTION_TRACKS.md`. The immediate queue is Track 1 MVP Release:

```text
Batch 21A -> Batch 21B -> Batch 22 -> Batch 23 -> Batch 25 -> Batch 26 -> Batch 27 -> Batch 28 -> Batch 29
```

## Batch Execution Flow

Every batch follows this order:

1. Review source documentation.
2. Identify dependencies and blocked areas.
3. Update or create required architecture docs.
4. Implement scoped code only.
5. Add migrations when persistence changes.
6. Add tests or compile-time validation appropriate to the layer.
7. Run validation commands.
8. Generate an implementation report.
9. Record open issues and future dependencies.
10. Commit the batch checkpoint.

## Source Of Truth Order

When documents conflict, use this priority:

1. `CLAUDE.md`
2. `docs/product/prd.md`
3. `docs/convergence/governance-graph.md`
4. `docs/convergence/knowledge-graph.md`
5. Relevant architecture docs
6. Relevant data docs
7. Relevant module docs
8. Release train docs
9. User batch prompt

If a prompt conflicts with higher-priority docs, update documentation or explain the conflict rather than implementing around it.

## Scope Control

- Do not skip batches.
- Do not implement future-batch functionality early.
- Do not redesign Zig.
- Do not introduce alternate architecture.
- Do not add modules outside the documented product surface unless PRD is updated first.
- Do not leave generated, unrelated, or accidental files staged.

## Required Deliverables

Every batch must produce:

- Code or documentation changes matching the batch objective
- Architecture updates where applicable
- Tests or validation
- Implementation report
- Open issues list
- Future dependency list

## Validation Minimum

Run the smallest meaningful validation set for the batch. For current repo shape:

- Docs-only batch: `npm run docs:lint`
- Web batch: `npm run build --workspace web` and `npm run lint --workspace web`
- Package batch: package `typecheck` scripts
- Database batch: migration syntax review and Supabase validation when linked environment is available

## Batch Completion

A batch is complete only when:

- The deliverables exist.
- The system remains deployable.
- Validation passes or limitations are documented.
- Tenant isolation is preserved.
- Implementation report is written.
- The batch is committed.
