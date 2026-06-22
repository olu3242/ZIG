# ZIG Governance Supervisor Agent — Batch 6

## What it is

The Governance Supervisor Agent ("Agent 10" in the mission text) is a **meta-agent**: it does
not run business recommendations through `orchestrateDomainAgent()` or the `agentRegistry`. It
inspects the records the other agents already produce — `AgentRunRecord` (from
`@zig/agent-runtime`), `GovernanceDecisionLogEntry` (from `@zig/agent-governance`), and
`RuntimeRecord` (from `@zig/runtime-persistence`) — and flags governance/safety violations.

It is implemented in `packages/supervisor-agents/src/index.ts`, extending the pre-existing
(near-empty) `@zig/supervisor-agents` stub package rather than creating a new package or
registering a 13th `AgentKey`. Per the mission's explicit constraints ("Do not create new
domain agents," "Do not expand agent count"), the supervisor has **no registry entry, no
`agentId`, and is never resolved through `agentRegistry` or `AgentRuntime.submit()`.** It is
pure analysis tooling that runs over already-persisted records — infrastructure, not a 13th
agent.

## Why this shape

- No registry, runtime, Event Fabric, governance guard, or `RbacEngine` code is modified or
  duplicated.
- All detection logic operates on existing public types (`AgentRunRecord`,
  `GovernanceDecisionLogEntry`, `RuntimeRecord`) — no new persistence layer, no new tables.
- Finalizing-action detection (`isFinalizingAction()`) matches generic substrings against the
  `action: string` field every `AgentDecision` already carries, instead of importing each
  domain/execution agent's per-agent action union. This avoids a dependency cycle from a
  meta-package back into every business package, and works across all of Batch 3/4/5's actual
  action names (`request_readiness_publication_approval`, `request_report_publication_approval`,
  `policy_finalization`, `request_evidence_rejection_approval`, `request_high_risk_approval`).

## API

`GovernanceSupervisorAgent` exposes one detector per mission-named flag, plus an aggregate
`supervise()`:

| Method | Mission flag(s) covered |
|---|---|
| `detectMissingGovernanceCheck(runs, governanceLog)` | execution without governance |
| `detectMissingAudit(runs, auditTrail)` | execution without audit |
| `detectMissingTenantContext(runs)` | missing tenant/org context |
| `detectMissingRationale(runs)` | missing rationale |
| `detectApprovalBypass(runs, governanceLog)` | approval bypass; rejected evidence without approval; readiness publication without approval; official report without approval; policy finalization without approval (unified — see below) |
| `detectExcessiveRetries(runs, maxAttempts?)` | excessive retries |
| `detectDuplicateRegistration(ids)` | duplicate registration |
| `detectUnsupportedEventCoverage(eventTypes, agentEventTypesByAgent)` | unsupported events silently ignored |
| `supervise({ runs, governanceLog, auditTrail, registeredAgentIds? })` | runs every detector above and produces one `SupervisorDecision` |

### Unified approval-bypass detection

The mission names five separate flags ("approval bypass," "rejected evidence without
approval," "readiness publication without approval," "official report without approval,"
"policy finalization without approval"). These are modeled as **one detector**
(`detectApprovalBypass`) because they share the same underlying violation shape: a finalizing
action (matched via `FINALIZING_ACTION_PATTERNS`) whose governance log entry does not have
`result.requiresApproval === true`. This is a deliberate simplification, not five independent
checks.

### `SupervisorDecision` output

Every `supervise()` call returns:

```ts
{
  severity, confidence, rationale, escalationRecommended, escalationTarget?,
  replayRecommended, rollbackRecommended, policyReferences, findings, auditPayload
}
```

- `escalationRecommended` is true when overall severity is `critical` or `high`; the
  recommended target is always `"compliance_supervisor"` (one of the six names already listed
  in the pre-existing `SupervisorAgentPlatform.supervisors()`).
- `replayRecommended` is true when any `excessive_retries` finding exists.
- `rollbackRecommended` is true when any `approval_bypass` or `missing_governance_check`
  finding exists.
- `confidence` decays with finding count (`0.95` clean, `max(0.5, 0.95 - 0.05 * findingCount)`
  otherwise).

## Events

Per the mission, the supervisor is conceptually subscribed to: `agent.run.started`,
`agent.run.completed`, `agent.failed`, `approval.required`, `policy.violation.detected`,
`replay.requested`, `agent.decision.created`. No new Event Fabric subscription code was added
in this batch — `supervise()` is called with already-collected `AgentRunRecord[]` /
`GovernanceDecisionLogEntry[]` / `RuntimeRecord[]` slices (e.g. from `AgentRuntime.listRuns()`,
`AgentGovernanceGuard.listLog()`, `RuntimePersistence`'s record store), which already carry the
information those events would deliver. Wiring a live Event Fabric subscriber is deferred —
see `ZIG_AGENT_COVERAGE_REPORT.md`.

## Testing

`packages/supervisor-agents/src/tests/governance-supervisor.test.ts` — 11 assertions covering:
missing governance check, missing audit, missing tenant context, missing rationale, approval
bypass (positive and negative case), excessive retries, duplicate registration, unsupported
event coverage, `supervise()` aggregation on an unhealthy run, `supervise()` aggregation on a
healthy run, and `computeAgentSocHealth()` (see `ZIG_AGENT_SOC.md`).
