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
