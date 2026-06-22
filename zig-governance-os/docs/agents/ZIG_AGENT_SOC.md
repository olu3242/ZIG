# Agent SOC (System Operations Center) — Batch 6

## What was built

`computeAgentSocHealth(runs, governanceLog)` in `packages/supervisor-agents/src/index.ts`
produces an `AgentSocHealthSnapshot`:

```ts
{
  runCount, successRate, failureRate, averageLatencyMs,
  replayCount, approvalCount, overrideCount, policyViolationCount, lastSuccessAt?
}
```

All fields are derived from data the runtime/governance layers already produce:

- `runCount` / `successRate` / `failureRate` — from `AgentRunRecord.status`.
- `averageLatencyMs` — `AgentRunRecord` does not store latency directly; it is derived by
  subtracting `startedAt` from `completedAt` for succeeded runs that have both timestamps set.
- `replayCount` — runs with `attempts > 0`.
- `approvalCount` — governance log entries with `result.requiresApproval === true`.
- `overrideCount` — governance log entries where policy violations were flagged
  (`result.policyViolations.length > 0`) but the action was still allowed
  (`result.allowed === true`) — i.e. an approver/policy override of a flagged violation. (Note:
  `AgentGovernanceGuard`'s outcome is `"policy_violation"` only when `allowed === false`, so
  override count is intentionally computed from the `policyViolations`/`allowed` combination
  directly rather than from `outcome`, since the literal `outcome === "policy_violation"` case
  can never coincide with `allowed === true`.)
- `policyViolationCount` — governance log entries with any `policyViolations`.
- `lastSuccessAt` — latest `completedAt` among succeeded runs.

## Admin surfaces

The mission names eight admin routes: `/admin/agent-control-tower`, `/admin/agent-soc`,
`/admin/agent-runs`, `/admin/agent-audit`, `/admin/agent-health`, `/admin/agent-approvals`,
`/admin/agent-events`, `/admin/agent-replay`.

Status as of Batch 6:

| Route | Status |
|---|---|
| `/admin/agent-control-tower` | Exists, renders against the Phase 2A registry (unchanged this batch). |
| `/admin/agent-soc` | Exists, but renders synthetic/demo data from unrelated packages (`@zig/agent-alerting`, `@zig/agent-chaos`, `@zig/agent-audit`, `@zig/agent-risk`, `@zig/agent-self-healing`) — **not wired to `AgentRuntime`/`AgentGovernanceGuard`/the new supervisor.** |
| `/admin/agent-runs`, `/admin/agent-audit`, `/admin/agent-health`, `/admin/agent-approvals`, `/admin/agent-events`, `/admin/agent-replay` | Do not exist. |

**Wiring these routes to live `AgentRuntime`/`AgentGovernanceGuard`/`GovernanceSupervisorAgent`
data is explicitly deferred in this batch**, consistent with every prior batch's deferral of
admin-tower UI wiring (Batches 2D, 3, 4, 5). The output shapes (`SupervisorDecision`,
`SupervisorFinding`, `AgentSocHealthSnapshot`) are ready for a UI to consume; no UI route was
added or changed. See `ZIG_AGENT_COVERAGE_REPORT.md` for the gap this leaves.

## Testing

`computeAgentSocHealth()` is covered by one assertion block in
`packages/supervisor-agents/src/tests/governance-supervisor.test.ts` exercising every field
(`runCount`, `successRate`, `failureRate`, `averageLatencyMs`, `approvalCount`,
`policyViolationCount`, `overrideCount`) against a mixed succeeded/failed run set and a
governance log entry with policy violations that was still allowed.
