# ZIG Agent Runtime — Phase 2B

## Canonical flow

```
Event (agent-ingestion)
  -> Agent Registry (agents: resolve by id / capability / event type)
  -> Runtime Queue (runtime-queue: enqueue, retry, dead-letter)
  -> Worker (agent-runtime: execute())
  -> Runtime Persistence (runtime-persistence: record)
  -> Audit Records
```

Implemented in `packages/agent-runtime` as `AgentRuntime`. No parallel runtime was created:
`AgentIngestion`, `RuntimeQueue`, and `RuntimePersistence` are used exactly as they already
existed; `AgentRuntime` is the missing glue, not a replacement.

## Resolution

`AgentRuntime.resolveAgent()` resolves in this order, first match wins:

1. Explicit `agentId` (`getAgentById`).
2. `capability` (`getAgentsByCapability`, first match).
3. `type` — the generic `AgentEventType` (`getAgentsByEventType`, first match).

If none resolve, `UnsupportedAgentEventError` is thrown — execution fails safely rather than
silently no-op-ing.

## Records

`AgentRunRecord` mirrors the existing `agent_runs`/`agent_decisions` tables
(`supabase/migrations/202606180006_production_convergence.sql`) at the in-process level, the
same way `RuntimePersistence`/`RuntimeQueue` already model their tables without owning a
database connection. Every record carries: `agentId`, `eventId`, `tenantId`, `organizationId`,
`userId`, `status`, `attempts`, timestamps, `inputSummary`/`outputSummary`, `confidence`, and
`errorMessage` on failure.

## Retry, dead-letter, replay

- `RuntimeQueue.nextAttempt()` (existing, unmodified) increments attempts and flips a job to
  `dead_letter` once `maxAttempts` (3) is reached.
- `AgentRuntime.execute()` catches handler errors, advances the job via `nextAttempt()`, and
  marks the run `failed` or `dead_letter` accordingly.
- `AgentRuntime.replay()` re-queues a `failed`/`dead_letter` run with a fresh job, preserving
  tenant/agent context, and only succeeds if the run is actually eligible.

## What Phase 2C+ builds on this

The Governance Guard (`packages/agent-governance`) sits between resolution and execution:
`Event -> Registry -> Governance Guard -> Execute -> Audit`. The Evidence Review Agent
(`packages/agent-evidence-review`) is the first handler wired through the full path.

## Validation

- `npx tsx packages/agent-runtime/src/tests/runtime.test.ts` — 8 assertions, `[PASS]`.
- `npx tsc -p packages/agent-runtime/tsconfig.json --noEmit` clean.
