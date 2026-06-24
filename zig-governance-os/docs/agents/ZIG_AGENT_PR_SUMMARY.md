# ZIG Agent OS — PR Summary (`feature/zig-agent-os`)

## Batches completed

| Batch | Scope | Status |
|---|---|---|
| 1 | Audit: gap report + scope map | Complete (`ZIG_AGENT_GAP_REPORT.md`, `ZIG_AGENT_SCOPE_MAP.md`) |
| 2A–2D | Canonical registry reconciliation; `AgentRuntime`; `AgentGovernanceGuard`; Evidence Review Agent end-to-end | Complete |
| 3 | Domain Intelligence Agents: Framework Mapping, Risk Assessment, Control Advisor, Policy Artifact | Complete |
| 4 | Execution Layer Agents: Readiness Scoring, Remediation, Reporting | Complete |
| 5 | Learning Path Agent, Career Portfolio Agent | Complete |
| 6 | Governance Supervisor Agent (meta-agent), Agent SOC health/telemetry | Complete |
| 7 | Trigger Automation dispatcher (`@zig/agent-trigger-automation`) + admin test-trigger harness | Complete |
| 8 | Final readiness review (this PR's merge-readiness checkpoint) | Complete |

## Agents implemented (11, all routed through the same runtime/governance path)

Evidence Review, Framework Mapping, Risk Assessment, Control Advisor, Policy Artifact,
Readiness Scoring, Remediation, Reporting, Learning Path, Career Portfolio — plus the
Governance Supervisor meta-agent (analysis-only, not registry-resolved). All reuse the
pre-existing 12-entry `agentRegistry` from Phase 2A; **no new `AgentKey` was ever registered**
across any batch.

## Core infrastructure reconciled

- Single canonical `agentRegistry` (`packages/agents`).
- Single `AgentRuntime` (submit/execute/retry/dead-letter/audit trail) in `agent-runtime`.
- Single `AgentGovernanceGuard` (tenant/role/tool/policy/approval checks) in
  `agent-governance`, built on the existing `RbacEngine`.
- Single shared `orchestrateDomainAgent()` helper (introduced in Batch 3, reused by Batches
  4 and 5 by import, not by copy) standardizing the Event → Registry → Governance → Runtime →
  Domain Engine → Decision → Audit path for every agent after Evidence Review.

## Runtime / governance / audit / replay coverage

Every agent: governed before execution (denial short-circuits to a failed, audited run with no
recommendation produced); decision carries `reason`/`dataUsed`/`confidence`; run persisted via
`RuntimePersistence`; governance evaluation independently logged via
`AgentGovernanceGuard.listLog()`; failed/denied runs are replay-tested back to `queued`; risky
finalizing actions (evidence rejection, policy finalization, readiness/report publication,
high-risk remediation) carry `requiresApproval`. Batch 6 adds a supervisory layer
(`GovernanceSupervisorAgent`) that audits these guarantees after the fact across a batch of
runs and recommends escalation/replay/rollback.

## Tests added

~83 assertions across 7 packages' test suites (`agent-runtime`, `agent-governance`,
`agent-evidence-review`, `agent-domain-intelligence` ×4, `agent-learning-career` ×2,
`agent-execution` ×3, `supervisor-agents`), all `[PASS]` via `npx tsx`. Per-suite breakdown in
`ZIG_AGENT_IMPLEMENTATION_REPORT.md`.

## Validation command results

See `ZIG_AGENT_MERGE_READINESS.md` for the full table. Summary: lint clean, typecheck clean
across 11 packages, all test suites pass, `web` and `admin` both build successfully.

## Known limitations / deferred work

- Admin UI (`/admin/agent-soc` and 5 named-but-missing routes) is not wired to real
  agent-runtime/governance/supervisor data — still synthetic demo content.
- No live Event Fabric subscription for the Governance Supervisor; it operates on
  already-collected record slices.
- Pre-existing `@zig/frameworks`/`@zig/framework-engine` dual registry flagged, not resolved.
- No dedicated "career"/"portfolio" agent id or RBAC resource (documented reuse decision).
- No standalone "tasks" engine for Remediation Agent output.
- `@zig/approvals`/`@zig/agent-approvals` reviewed, not adopted (governance guard's own
  approval signaling used instead).

Full detail in `ZIG_AGENT_MERGE_READINESS.md`'s "Known limitations" section.

## Migration notes

None. No `supabase/migrations/` content exists in this repo yet (pre-Fable-1 per root
`CLAUDE.md`); this PR is entirely application/package code, tests, and docs.

## Risk notes

- Reverting this PR is a clean revert: no production data, no migrations, no schema, no
  third-party dependency changes.
- Approval-bypass detection in the Governance Supervisor uses generic substring matching on
  `decision.action` — covers all 13 current finalizing actions but would need extending if a
  future agent's action name doesn't match the existing pattern list.

## Recommended reviewer focus areas

1. `agent-governance` and `agent-runtime` — the shared dependency of every other package.
2. `supervisor-agents` (newest code) — especially `overrideCount` semantics and the
   finalizing-action pattern list.
3. `ZIG_AGENT_PERMISSION_MATRIX.md` vs. actual `approvalAction` wiring per agent.
4. Each batch's "Explicitly deferred" list in `ZIG_AGENT_IMPLEMENTATION_REPORT.md`.

---

## PR description (ready to use)

**Title:** ZIG Agent OS: Runtime, Governance, Domain Agents, Trigger Automation, SOC, and
E2E Certification

### 1. Executive Summary

Builds the ZIG Agent OS from a flat agent registry into a governed, audited, replayable
runtime spanning 10 business agents, a governance supervisor meta-agent, and an outward-facing
trigger-automation dispatcher layer — all routed through one shared runtime/governance path.
No new runtime, no RBAC replacement, no duplicated registries, no new agent count beyond the
pre-existing 12-entry registry.

### 2. Architecture Decisions

- Agents are orchestration layers over existing domain engines — no domain engine was
  modified or duplicated.
- `orchestrateDomainAgent()` is shared by import across Batches 3–5, not copy-pasted.
- The Governance Supervisor is intentionally **not** a registered agent — it's analysis
  tooling over already-collected records, consistent with "do not expand agent count."
- Approval-bypass detection is unified across 5 mission-named flag types via one
  pattern-matching detector rather than 5 separate ones.
- The trigger-automation dispatcher (`@zig/agent-trigger-automation`) defines a third,
  deliberately smaller, outward-facing `DomainEventType` vocabulary (10 members) that
  translates into each agent's own internal trigger union — it is a routing layer, not a
  parallel runtime; every branch except one (`agent.failed`) calls an existing agent function
  that already submits through `AgentRuntime`/`AgentGovernanceGuard`.
- Type-safety for the dispatcher's polymorphic return value uses a generic overload keyed by
  a literal-mapped result interface (`DomainEventResultMap`), avoiding `any`/unsafe casts at
  every call site.

### 3. Agent Coverage

10 business agents (Evidence Review, Framework Mapping, Risk Assessment, Control Advisor,
Policy Artifact, Readiness Scoring, Remediation, Reporting, Learning Path, Career Portfolio)
+ 1 supervisor meta-agent, **0 new registry entries** — every agent reuses the pre-existing
12-entry `agentRegistry` from Phase 2A. Full per-agent breakdown (registry/trigger/runtime/
governance/handler/decision/audit/approval/replay/admin-visibility/tests/docs) in
`docs/agents/ZIG_AGENT_COVERAGE_MATRIX.md` — every cell COMPLETE except "Admin visibility,"
honestly marked PARTIAL across every row (no per-agent admin detail view exists anywhere in
the repo).

### 4. Trigger Automation

New package `@zig/agent-trigger-automation` defines one canonical 10-member `DomainEventType`
union and one entry point, `emitDomainEvent()`, routing each event to the existing agent
function(s) that already implement Registry → Governance → Runtime → Decision → Audit.
`gap.detected` and `module.completed` are fan-out events, each independently invoking two
agent functions. `agent.failed` is the one documented exception, calling
`GovernanceSupervisorAgent.supervise()` directly since that meta-agent inspects
already-collected records rather than producing a new run. Full routing table and payload
contract in `docs/agents/ZIG_AGENT_TRIGGER_MAP.md`.

### 5. Governance + Approvals

Every agent execution is preceded by a governance check; denials short-circuit before any
recommendation is produced; risky finalizing actions (evidence rejection, policy
finalization, readiness/report publication, high-risk remediation, certification-readiness
publish) require explicit approval, each carrying a named `approvalAction`; every evaluation
is independently logged via `AgentGovernanceGuard.listLog()`; tenant isolation is enforced at
the guard level, not just the UI.

### 6. Runtime + Replay

Every agent flows through the single `AgentRuntime` introduced in Phase 2B (submit/execute,
retry, dead-letter at 3 attempts, audit trail) — unmodified across every later batch,
including trigger automation. `AgentRuntime.replay()` re-queues failed/dead-letter runs and
is proven per-package (e.g. `agent-domain-intelligence`'s `assertReplayPath()`); the
dispatcher layer does not need its own replay path since it introduces no second runtime.

### 7. Agent SOC

Governance Supervisor meta-agent + Agent SOC health/telemetry computation over run/
governance/audit record slices. As of `feature/zig-agent-os-live-wiring`, `/admin/agent-soc`
now renders **real, non-synthetic** fleet health via `computeAgentSocHealth()` over a shared,
process-local `AgentRuntime`/`AgentGovernanceGuard` pair (the same instances the
`/admin/agent-soc/test-triggers` panel and `/admin/agent-soc/runs` per-agent history read).
Honest limitation, now prominently surfaced as a banner in the `/admin/agent-soc` UI itself
(not just in docs): this is in-memory, process-local data — it resets on every restart/
redeploy and does not aggregate runs from the separate `apps/web` deployment. No durable
cross-process store exists for `AgentRunRecord`/`GovernanceDecisionLogEntry` in this repo;
building one would require new schema/migrations, which is out of scope (no
`supabase/migrations/` exists yet per root `CLAUDE.md`). The test-trigger panel is now
explicitly labeled "Dev/Test Trigger Harness — not proof of production workflow wiring."

### 7a. Production Trigger Coverage (re-verified this batch)

Re-checked all 10 canonical triggers against current code. **1/10 is production-wired**:
`framework.selected`, via `emitFrameworksSelectedEvent()` in
`apps/web/app/onboarding/actions.ts`, fired only after a real Supabase `profiles` upsert
succeeds. The remaining 9 are genuinely blocked by missing product workflows, not by
missing agent-OS capability — confirmed by reading each candidate page's current source:

- `evidence.uploaded`, `assessment.completed`, `report.requested`, `module.completed`,
  `lab.completed` — read-only pages over static MVP/demo fixtures, no submit handler.
- `risk.created` / `risk.scored` — `risk/new/page.tsx`'s only button is `type="button"`
  with no `formAction`; no server action or persistence path exists.
- `gap.detected` — `gaps/page.tsx` does call a real engine (`GapAssessmentEngine.assess()`
  from `@zig/gaps`) but with hardcoded inputs (`40`, `index + 3`), not live data — wiring
  this now would emit events with fabricated readiness numbers, which violates the
  "never emit before a real mutation succeeds" rule. Classified PARTIAL (real call site,
  fabricated inputs), not wired.
- `agent.failed` — bypasses `AgentRuntime.submit()` by design; no real aggregation call
  site outside the admin test panel/tests exists in `apps/web`.

No new production triggers were wired this batch beyond the pre-existing
`framework.selected`. This is treated as a fully acceptable outcome per the mission's own
instructions, not a shortfall: wiring any of the 9 would have required either fabricating a
UI/handler/persistence path that doesn't exist (explicitly forbidden) or emitting events
before a real mutation (explicitly forbidden).

### 8. Test Coverage

~83 assertions across 7 packages' own test suites (`agent-runtime`, `agent-governance`,
`agent-evidence-review`, `agent-domain-intelligence` ×4, `agent-learning-career` ×2,
`agent-execution` ×3, `supervisor-agents`) plus 12 new dispatcher integration tests in
`@zig/agent-trigger-automation` (one per canonical trigger + 2 fan-out cases), all `[PASS]`
via `npx tsx`. Per-suite breakdown in `ZIG_AGENT_IMPLEMENTATION_REPORT.md`.

### 9. Validation Results

| Command | Result |
|---|---|
| `npx tsc --noEmit` across all touched packages | Clean |
| `npm run test --workspace @zig/agent-trigger-automation` | 12/12 `[PASS]` |
| All other packages' own test suites | All `[PASS]` (~83 assertions) |
| `npm run lint --workspace web` | Clean |
| `npm run lint --workspace admin` | Clean |
| `npm run build --workspace web` | Succeeds |
| `npm run build --workspace admin` | Succeeds; `/admin/agent-soc/test-triggers` in route manifest |

Full detail in `docs/agents/ZIG_AGENT_FINAL_READINESS.md` and
`docs/agents/ZIG_AGENT_RELEASE_READINESS.md`.

### 10. Docs Added

`ZIG_AGENT_GAP_REPORT.md`, `ZIG_AGENT_SCOPE_MAP.md`, `ZIG_AGENT_CORE_DECISION.md`,
`ZIG_AGENT_RUNTIME.md`, `ZIG_AGENT_PERMISSION_MATRIX.md`, `ZIG_AGENT_EVENT_CATALOG.md`,
`ZIG_AGENT_WORKFLOW_MAP.md`, `ZIG_AGENT_SAFETY_MODEL.md`, `ZIG_AGENT_IMPLEMENTATION_REPORT.md`
(updated through trigger automation), `ZIG_AGENT_SUPERVISOR.md`, `ZIG_AGENT_SOC.md`,
`ZIG_AGENT_COVERAGE_REPORT.md`, `ZIG_AGENT_COVERAGE_MATRIX.md` (new),
`ZIG_AGENT_TRIGGER_MAP.md` (new), `ZIG_AGENT_TEST_TRIGGER_GUIDE.md` (new),
`ZIG_AGENT_FINAL_READINESS.md` (new), `ZIG_AGENT_RELEASE_READINESS.md` (new), this summary,
and `ZIG_AGENT_MERGE_READINESS.md`.

### 11. Known Limitations

- **Production trigger coverage is 1/10** (`framework.selected`) — see section 7a. The
  other 9 are blocked by missing product workflows (no real form/action/persistence to
  mutate from), not by missing agent-OS capability.
- `/admin/agent-soc` fleet dashboard renders real (non-synthetic) data but is
  process-local/in-memory only — resets on restart, not shared with `apps/web`. Now
  prominently banner-labeled in the UI itself.
- Trigger automation's admin panel is a dispatcher/test-harness layer, not a production
  event bus — no webhook/UI fires `emitDomainEvent()` outside its own tests, the admin
  panel, and the one real `framework.selected` call site; no trigger chaining (each
  canonical event is dispatched independently). Now explicitly labeled "Dev/Test Trigger
  Harness — not proof of production workflow wiring" in `/admin/agent-soc/test-triggers`.
- No live Event Fabric subscription for the Governance Supervisor; it operates on
  already-collected record slices.
- Pre-existing `@zig/frameworks`/`@zig/framework-engine` dual registry flagged, not resolved
  (predates this work).
- No dedicated "career"/"portfolio" agent id or RBAC resource (documented reuse decision).
- No standalone "tasks" engine for Remediation Agent output.
- `@zig/approvals`/`@zig/agent-approvals` reviewed, not adopted (governance guard's own
  approval signaling used instead).

Full detail in `docs/agents/ZIG_AGENT_MERGE_READINESS.md` and
`docs/agents/ZIG_AGENT_RELEASE_READINESS.md`.

### 12. Reviewer Checklist

- [ ] `agent-governance`/`agent-runtime` core logic — the shared dependency of every other
      package
- [ ] `supervisor-agents` (especially `overrideCount` semantics and the finalizing-action
      pattern list)
- [ ] `@zig/agent-trigger-automation`'s `emitDomainEvent()` routing table vs.
      `ZIG_AGENT_TRIGGER_MAP.md` — confirm every branch genuinely flows through
      `AgentRuntime`/`AgentGovernanceGuard` except the documented `agent.failed` exception
- [ ] `ZIG_AGENT_PERMISSION_MATRIX.md` vs. actual `approvalAction` wiring per agent
- [ ] Each batch's documented deferrals in `ZIG_AGENT_IMPLEMENTATION_REPORT.md` are genuinely
      safe to defer
