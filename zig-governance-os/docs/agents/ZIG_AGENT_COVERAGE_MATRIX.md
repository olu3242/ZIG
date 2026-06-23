# ZIG Agent Coverage Matrix

One row per agent. Status legend: **COMPLETE** (fully wired and tested), **PARTIAL**
(wired but with an honestly documented depth limitation), **BLOCKED** (not wired — none in
this repo as of this batch).

| Agent (id) | Registry | Trigger (dispatcher) | Runtime | Governance | Handler | Decision | Audit | Approval | Replay | Admin visibility | Tests | Docs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Evidence Review (`evidence`) | COMPLETE | COMPLETE (`evidence.uploaded`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`evidence_rejection`) | COMPLETE | PARTIAL — no dedicated admin route surfaces this agent's runs; reachable via the generic `/admin/runtime` metrics and the new test-trigger panel | COMPLETE (10 unit + 1 dispatcher) | COMPLETE |
| Framework Mapping (`compliance`) | COMPLETE | COMPLETE (`framework.selected`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | N/A — no finalizing action defined | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Risk Assessment (`risk`) | COMPLETE | COMPLETE (`risk.created`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | N/A — no finalizing action defined | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Control Advisor (`control`) | COMPLETE | COMPLETE (`risk.scored`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | N/A — no finalizing action defined | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Policy Artifact (`policy`) | COMPLETE | COMPLETE (`gap.detected`, fan-out #1) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`policy_finalization`, always set on draft) | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Remediation (`audit`) | COMPLETE | COMPLETE (`gap.detected`, fan-out #2) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`high_risk_recommendation`, conditional on risk band) | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Readiness Scoring (`assessment`) | COMPLETE | COMPLETE (`assessment.completed`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`readiness_scoring`, conditional on `requestPublish`) | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Reporting (`executive`) | COMPLETE | COMPLETE (`report.requested`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`report_generation`, conditional on `isOfficial`) | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Learning Path (`learning`) | COMPLETE | COMPLETE (`module.completed`, fan-out #1) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | N/A — no finalizing action defined | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Career Portfolio (`certification`) | COMPLETE | COMPLETE (`module.completed` fan-out #2, `lab.completed`) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE (`readiness_scoring`, conditional on `requestPublish`) | COMPLETE | PARTIAL — same as above | COMPLETE | COMPLETE |
| Governance Supervisor (meta-agent, no `AgentId`) | N/A — by design, not registry-resolved | COMPLETE (`agent.failed`, direct call) | N/A — by design, does not submit a run | N/A — by design, inspects governance log rather than being gated by it | COMPLETE (`supervise()`) | COMPLETE (`SupervisorDecision`) | N/A — by design, reads audit trail rather than writing to it | N/A — has no finalizing action of its own | N/A | PARTIAL — `/admin/agent-soc` shows unrelated synthetic demo data; the new test-trigger panel exercises `supervise()` with synthetic fixture records, not a live fleet-wide aggregation | COMPLETE (11 unit + 1 dispatcher) | COMPLETE |

## Notes

- **"Admin visibility = PARTIAL" is consistent across every row** because no agent (old or
  new) has a dedicated per-agent admin detail view; the new `/admin/agent-soc/test-triggers`
  panel is a manual dispatcher test harness, not a per-run/per-agent observability surface.
  This is an honest, repo-wide limitation carried forward from prior batches
  (`ZIG_AGENT_COVERAGE_REPORT.md`), not introduced by this batch.
- **"Tests = COMPLETE" counts two layers per agent**: the agent's own unit test suite (already
  existing, unchanged by this batch) plus this batch's one dispatcher integration test (and,
  for the two fan-out events, one additional dispatcher test each).
- **Replay**: every agent that flows through `AgentRuntime` inherits `AgentRuntime.replay()`
  for free (proven per-agent in each package's own test suite, e.g.
  `agent-domain-intelligence/src/tests/risk-assessment.test.ts`'s `assertReplayPath()`); the
  trigger automation dispatcher does not need its own replay path since it does not introduce
  a second runtime.
