# ZIG Agent Coverage Matrix

One row per agent. Status legend: **COMPLETE** (fully wired and tested), **PARTIAL**
(wired but with an honestly documented depth limitation), **BLOCKED** (not wired — none in
this repo as of this batch).

| Agent (id) | Registry | Trigger (dispatcher) | Runtime | Governance | Handler | Decision | Audit | Approval | Replay | Admin visibility | Tests | Docs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Evidence Review (`evidence`) | COMPLETE | COMPLETE (`evidence.uploaded`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`evidence_rejection`) | COMPLETE | COMPLETE — `/admin/agent-soc/runs` shows this agent's recent runs (status, timestamps, decision, governance result), sourced from the same process-local store the test-trigger panel writes to | COMPLETE (10 unit + 1 dispatcher) | COMPLETE |
| Framework Mapping (`compliance`) | COMPLETE | COMPLETE (`framework.selected`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | N/A — no finalizing action defined | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Risk Assessment (`risk`) | COMPLETE | COMPLETE (`risk.created`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | N/A — no finalizing action defined | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Control Advisor (`control`) | COMPLETE | COMPLETE (`risk.scored`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | N/A — no finalizing action defined | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Policy Artifact (`policy`) | COMPLETE | COMPLETE (`gap.detected`, fan-out #1) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`policy_finalization`, always set on draft) | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Remediation (`audit`) | COMPLETE | COMPLETE (`gap.detected`, fan-out #2) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`high_risk_recommendation`, conditional on risk band) | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Readiness Scoring (`assessment`) | COMPLETE | COMPLETE (`assessment.completed`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`readiness_scoring`, conditional on `requestPublish`) | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Reporting (`executive`) | COMPLETE | COMPLETE (`report.requested`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`report_generation`, conditional on `isOfficial`) | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Learning Path (`learning`) | COMPLETE | COMPLETE (`module.completed`, fan-out #1) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | N/A — no finalizing action defined | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Career Portfolio (`certification`) | COMPLETE | COMPLETE (`module.completed` fan-out #2, `lab.completed`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`readiness_scoring`, conditional on `requestPublish`) | COMPLETE | COMPLETE — same as above | COMPLETE | COMPLETE |
| Governance Supervisor (meta-agent, no `AgentId`) | N/A — by design, not registry-resolved | COMPLETE (`agent.failed`, direct call) | N/A — by design, does not submit a run | N/A — by design, inspects governance log rather than being gated by it | COMPLETE (`supervise()`) | COMPLETE (`SupervisorDecision`) | N/A — by design, reads audit trail rather than writing to it | N/A — has no finalizing action of its own | N/A | COMPLETE — `/admin/agent-soc` now renders `computeAgentSocHealth()` over real (not synthetic) accumulated runs/governance log within this process; `/admin/agent-soc/runs` documents the supervisor's own row as intentionally empty (it inspects records, it does not produce `AgentRunRecord`s of its own) | COMPLETE (11 unit + 1 dispatcher) | COMPLETE |

## Notes

- **"Admin visibility" updated this batch (`feature/zig-agent-os-live-wiring`)**: every row is
  now **COMPLETE** rather than the prior PARTIAL. `/admin/agent-soc` computes real fleet health
  via `computeAgentSocHealth()` over a shared, process-local `AgentRuntime`/
  `AgentGovernanceGuard` pair, and the new `/admin/agent-soc/runs` view shows real, recent
  per-agent `AgentRunRecord`s (status, timestamps, decision, governance result) for all 10
  business agents plus the Governance Supervisor meta-agent. The honest caveat carried
  forward: this is **process-local, in-memory data**, not a durable cross-process store — a
  fresh `apps/admin` process starts at zero, and none of this is shared with the separate
  `apps/web` deployment (which has its own, separately-wired `framework.selected` events that
  do not appear in the admin views). See `docs/agents/ZIG_AGENT_LIVE_WIRING.md` for the full
  explanation and what durable persistence would require.
- **"Tests = COMPLETE" counts two layers per agent**: the agent's own unit test suite (already
  existing, unchanged by this batch) plus this batch's one dispatcher integration test (and,
  for the two fan-out events, one additional dispatcher test each).
- **Replay**: every agent that flows through `AgentRuntime` inherits `AgentRuntime.replay()`
  for free (proven per-agent in each package's own test suite, e.g.
  `agent-domain-intelligence/src/tests/risk-assessment.test.ts`'s `assertReplayPath()`); the
  trigger automation dispatcher does not need its own replay path since it does not introduce
  a second runtime.
