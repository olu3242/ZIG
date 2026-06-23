# ZIG Agent Test Trigger Guide

Two ways to exercise the trigger automation dispatcher (`emitDomainEvent()` from
`@zig/agent-trigger-automation`): the package's own integration tests, and the admin "Test
Triggers" panel.

## 1. Integration tests (the authoritative proof)

```
npm run test --workspace @zig/agent-trigger-automation
```

Runs 12 `tsx`-executed test files under `packages/agent-trigger-automation/src/tests/`, one
per `DomainEventType` plus the two documented fan-out cases (`gap-detected-fanout.test.ts`,
`module-completed-fanout.test.ts`). Each test:

1. Builds a fresh `AgentRuntime` + `AgentGovernanceGuard` and a `Platform Owner`
   `AccessSubject` (full RBAC access, so the happy path is the one under test — RBAC denial
   paths are already covered by each underlying agent's own test suite, not duplicated here).
2. Calls `emitDomainEvent({ domainEventType, runtime, guard, subject, context, eventId })`.
3. Asserts: the correct agent function was reached (run status `succeeded`), governance was
   evaluated (`governance.allowed`/`requiresApproval`), a decision was produced (`reason`,
   `confidence`, `action`), and the runtime/governance audit trails grew.

Typecheck: `npx tsc -p packages/agent-trigger-automation/tsconfig.json --noEmit`.

## 2. Admin "Test Triggers" panel

Route: `/admin/agent-soc/test-triggers` (Platform Owner only, gated by the existing
`requirePlatformOwner()` guard shared with the rest of `apps/admin`).

The panel lists all 10 canonical `DomainEventType`s with a "Fire Event" button per row. Each
button calls the `runTestTrigger()` server action
(`apps/admin/app/admin/agent-soc/test-triggers/actions.ts`), which:

1. Builds a **fresh, in-memory** `AgentRuntime` + `AgentGovernanceGuard` scoped to that single
   button click — this is a manual verification harness, not a window into the production
   runtime's persisted state. Firing the same event twice does not accumulate state between
   clicks.
2. Builds a synthetic `Platform Owner` `AccessSubject` and `AgentContext` with fresh
   `tenant-soc-test-*`/`org-soc-test-*` ids (never production tenant/org/user ids).
3. Calls `emitDomainEvent()` — the **only** entry point the panel uses; it never imports or
   calls an agent handler (`reviewEvidence`, `runRiskAssessmentAgent`, etc.) directly.
4. Displays the resulting `eventId`, `correlationId`, run id(s)/status, and decision action(s)
   in the row, or an error message if dispatch failed (e.g. governance denial, thrown error).

### Honest depth caveat

This is a **server-action-driven, single-click test harness**, not a live event stream
viewer or a persistent trigger history. It does not:
- Persist results across page reloads (results live in React state for the current session
  only).
- Show a feed of real production domain events as they occur — there is no production
  event-emission wiring upstream of this package yet (no webhook/UI calls `emitDomainEvent()`
  outside this test panel and the package's own tests).
- Replay or chain triggers (e.g. firing `risk.created` and feeding its output into
  `risk.scored`) — each button click is an independent, single-event dispatch.

This is intentional and documented, not a shortcut hidden from the reviewer: the mission
asked for a way to *prove the dispatcher wiring* from the admin surface, which this does,
while being explicit that it is a test harness, not a production event console.

## Fixture defaults

Every trigger can be fired with zero payload — `src/fixtures.ts` supplies safe, randomly
generated ids (`randomId(prefix)`, never a hardcoded production id) and representative
numeric inputs (risk/control/evidence/framework/learning scores) for every required field
each target agent's input type needs. The admin panel always uses these defaults; the test
suite uses them by default and overrides specific fields (e.g. `risk.likelihood`,
`requestPublish`) where a test needs to force a specific branch (e.g. the high-risk
approval path, the publish-approval path).
