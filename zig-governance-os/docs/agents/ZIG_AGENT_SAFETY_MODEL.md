# ZIG Agent Safety Model — Phase 2C

## Runtime flow with governance

```
Event -> Registry -> Governance Guard -> Execute -> Audit
```

If `AgentGovernanceGuard.evaluate()` returns `allowed: false`, `AgentRuntime.execute()` is
still called, but with a handler that immediately throws the denial reason — the run is
persisted as `failed` with `errorMessage` set to the denial reason, and an audit record is
written. **Execution never proceeds past a denial.** This is enforced by
`reviewEvidence()` in `packages/agent-evidence-review/src/index.ts`: it evaluates governance
*before* invoking the recommendation handler, and short-circuits to a failed, audited run if
denied — no recommendation is produced for a denied request.

## Approval path

If `requiresApproval: true`, the run still completes (the agent's job is to recommend, not to
gate its own output) but the result carries `escalationTarget: "human_approver"`. For
evidence rejection specifically, `reviewEvidence()` re-evaluates governance with
`approvalAction: "evidence_rejection"` and `action: "approve"` after producing the
recommendation, so the approval requirement is itself an auditable governance decision, not
just a string on the output.

## Never-finalize rule

The Evidence Review Agent never finalizes evidence state. `EvidenceManagementEngine`
(existing, unmodified) has no mutating approve/reject method — there is nothing for the agent
to bypass. Every action it emits is named `recommend_*` except
`request_evidence_rejection_approval`, which explicitly names the approval gate rather than
implying any of `recommend_evidence_acceptance`/`refresh`/`missing`/`rework` ever auto-applies.

## Safe-stop guarantee

- Unsupported domain/runtime events: `AgentRuntime.resolveAgent()` throws
  `UnsupportedAgentEventError` rather than guessing an agent.
- Missing tool access: denied by the guard before execution.
- Tenant mismatch: denied by the guard before role/resource checks even run.
- Handler exceptions: caught by `AgentRuntime.execute()`, recorded as `failed`/`dead_letter`,
  never thrown uncaught into the caller.

## Logging

`AgentGovernanceGuard.listLog()` records every evaluation (allowed, denied,
approval_requested, policy_violation) with `agentId`/`tenantId`/`userId`/timestamp — the
source for admin-tower "denied actions" / "approval requests" / "policy violations" views
(Part C, admin visibility).

## Batch 6 — Supervisory layer over the safety model

The safe-stop guarantees above are individually enforced at execution time by
`AgentRuntime`/`AgentGovernanceGuard`. Batch 6 adds a **supervisory** layer
(`GovernanceSupervisorAgent` in `@zig/supervisor-agents`, see
`docs/agents/ZIG_AGENT_SUPERVISOR.md`) that audits, after the fact, whether those guarantees
actually held across a batch of runs — catching cases where a guarantee was bypassed,
mis-wired, or never invoked for a given run:

- "Execution never proceeds past a denial" is checked retroactively by
  `detectMissingGovernanceCheck()` (a completed run with no matching governance log entry at
  all) and `detectApprovalBypass()` (a finalizing run whose governance entry didn't actually
  require approval).
- "Handler exceptions ... recorded as `failed`/`dead_letter`" is checked by
  `detectExcessiveRetries()`, which flags `dead_letter` runs and any run nearing its retry
  ceiling, recommending replay.
- The logging guarantee above (`listLog()`) is the direct input to every supervisor detector —
  the supervisor adds no new logging, it consumes the existing log.
- `detectMissingAudit()` and `detectMissingTenantContext()` extend the safe-stop guarantee to
  two failure modes the runtime/governance guard do not themselves check post hoc: a run
  silently missing from the audit trail, and a run missing tenant/user context entirely.

The supervisor is advisory: it never blocks or replays a run itself. It produces a
`SupervisorDecision` (severity, escalation/replay/rollback recommendation, rationale) for a
human or downstream process to act on — it is a meta-agent over records, not a gate in the
execution path.
