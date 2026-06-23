# ZIG Agent Implementation Report — Batches 2B–2D, 3, 4, 5, 6

## Scope

Connect the Phase 2A canonical registry to a real, governed, auditable runtime, and prove it
end-to-end with one vertical slice (Evidence Review Agent). No new runtime, no RBAC
replacement, no reimplementation of evidence/risk/control engines, no 13th agent.

## New packages

| Package | Role | Wraps / extends |
|---|---|---|
| `@zig/agent-runtime` | `AgentRuntime`: submit/execute/replay, retry, dead-letter, audit trail | `@zig/agent-ingestion`, `@zig/runtime-queue`, `@zig/runtime-persistence`, `@zig/agents` |
| `@zig/agent-governance` | `AgentGovernanceGuard`: tenant/role/tool/policy/approval checks | `@zig/governance-engine` (`RbacEngine.can()`), `@zig/agents` |
| `@zig/agent-evidence-review` | Evidence Review Agent handler + `reviewEvidence()` orchestrator | `@zig/evidence` (`EvidenceManagementEngine`), `@zig/agent-runtime`, `@zig/agent-governance` |

## One incidental fix

`packages/governance-engine/src/rbac/RbacEngine.ts`'s `rolePermissions` map was missing 4 of
the 15 `RoleName` values (`Platform Owner`, `Governance Manager`, `Risk Manager`,
`Compliance Manager`) — a pre-existing type-safety gap that surfaced as a compile error the
moment a new package (`@zig/agent-governance`) actually typechecked against `RbacEngine` with
its own `tsconfig.json` (the package previously had none, so this was never caught). Added
the four missing role permission sets, conservative and consistent with neighboring roles
(`Platform Owner` mirrors `Platform Admin`; the three Manager roles mirror their
Analyst/Manager counterparts already present). No behavior for any of the 11 already-defined
roles changed.

## What was proven end-to-end

`reviewEvidence()` exercises the full path for the Evidence Review Agent:

```
domain event -> ingestion -> registry resolution -> governance check
  -> runtime execution -> evidence engine -> decision persistence
  -> approval check (if rejection) -> audit trail
```

10 tests cover: all four health outcomes -> their `recommend_*` action, rejection ->
`request_evidence_rejection_approval` with `requiresApproval: true`, tenant context
preservation, RBAC denial stopping execution before any recommendation is produced, domain
event routing, and the generic `AgentEventType` lifecycle remaining unchanged underneath.

## Validation

- `npx tsc -p <pkg>/tsconfig.json --noEmit` clean for all 8 touched/created packages
  (`agents`, `agent-registry`, `agent-runtime`, `agent-governance`, `agent-evidence-review`,
  `agent-ingestion`, `runtime-queue`, `runtime-persistence`, `evidence`).
- Test suites: `agent-runtime` (8 assertions), `agent-governance` (7 assertions),
  `agent-evidence-review` (10 assertions) — all `[PASS]` via `npx tsx`.
- `npm run lint --workspace web` clean.
- `npm run build --workspace web` and `npm run build --workspace admin` both succeed
  (admin's `agent-control-tower`/`agents` routes still generate against the Phase 2A
  reconciled registry).

## Explicitly deferred as of Batch 2D (now partially resolved by Batch 3)

- Framework Mapping, Risk Assessment, Control Advisor, Policy Artifact, Readiness Scoring,
  Remediation, Reporting, Career Portfolio, and Governance Supervisor agents are not wired to
  the runtime/governance layer yet — only the `"evidence"` agent is.
- Admin-tower UI wiring of `listAuditTrail()`/`listLog()` into a live screen is not done —
  the data shapes are ready for it, but no UI route was added or changed in this batch.
- `readiness_scoring`, `report_generation`, `policy_finalization`, `admin_action`,
  `high_risk_recommendation` approval actions are defined in the permission matrix but have
  no agent wired to trigger them yet.

## Batch 3 — Domain Intelligence Agents

### Scope

Wire the four Domain Intelligence Agents named in the mission (Framework Mapping, Risk
Assessment, Control Advisor, Policy Artifact) into the same runtime/governance/audit path
proven in Batch 2D, as orchestration layers only. No domain engine was modified or
duplicated; no new agent id was registered.

### New package

| Package | Role | Wraps / extends |
|---|---|---|
| `@zig/agent-domain-intelligence` | Four agent handlers + shared `orchestrateDomainAgent()` helper | `@zig/frameworks`, `@zig/risks`, `@zig/controls`, `@zig/policies`, `@zig/agent-runtime`, `@zig/agent-governance`, `@zig/agents` |

### Design decisions

- **Reused existing `agentRegistry` entries** — `"compliance"`, `"risk"`, `"control"`,
  `"policy"` — instead of registering four new agents. The 12-agent registry from Phase 2A
  is unchanged.
- **Shared orchestration helper** (`shared.ts`'s `orchestrateDomainAgent()`) extracted so all
  four agents replicate the exact Event → Registry → Governance Guard → Runtime → Domain
  Engine → Decision → Audit path with no copy-pasted runtime/governance wiring.
- **Two pre-existing framework registries exist** (`@zig/frameworks` and
  `@zig/framework-engine`). The Framework Mapping Agent orchestrates `@zig/frameworks`
  because it is the richer registry (10 frameworks incl. GDPR/CMMC) and the only one with a
  scoring method (`FrameworkIntelligenceEngine.score()`). `@zig/framework-engine` was left
  untouched. This dual-registry situation is a latent duplication risk worth resolving in a
  future consolidation pass — not addressed in this batch, since doing so was out of scope
  for "agents are orchestration layers, do not rebuild domain engines."
- **NIST AI RMF is not registered in either framework registry.** Rather than fabricating an
  entry, the agent returns an explicit `map_unsupported_framework` action with a rationale —
  an honest gap, not invented data.
- **Policy Artifact Agent has no dedicated RBAC resource.** `RbacEngine`'s `RbacResource`
  union has no `"policies"` entry, so the agent reuses `"reports"` (the closest existing
  approval-bearing resource), documented in a code comment in `policy-artifact.ts`.

### What was proven end-to-end (×4)

Each agent's `run*Agent()` function exercises the full path:

```
domain event -> orchestrateDomainAgent() -> registry resolution -> governance check
  -> runtime execution -> existing domain engine -> decision persistence -> audit trail
```

28 tests total (7 each for Framework Mapping, Risk Assessment, Control Advisor; 8 for Policy
Artifact, which adds an approval-required assertion), covering per agent: happy path,
failure path, tenant isolation, RBAC denial stopping execution, audit logging, explainability
(reason/dataUsed/confidence present), and replay of a denied/failed run back to `queued`.

### Validation

- `npm run typecheck --workspace @zig/agent-domain-intelligence` (`tsc --noEmit`) — clean.
- `npm run test --workspace @zig/agent-domain-intelligence` — all four suites `[PASS]`
  (`framework-mapping`, `risk-assessment`, `control-advisor`, `policy-artifact`).
- `npm run lint --workspace web` — clean.
- `npm run build --workspace web` and `npm run build --workspace admin` — both succeed.

### Explicitly deferred as of Batch 3 (now partially resolved by Batch 5)

- Learning Path, Reporting, Career Portfolio, and Governance Supervisor agents are not
  implemented.
- Readiness Scoring and Remediation agents (named in the queued Batch 4 prompt) are not
  implemented.
- Admin-tower UI wiring for the four Batch 3 agents' runs/decisions/approvals into a live
  screen is not done — same deferral as Batch 2D, carried forward.
- The `@zig/frameworks` / `@zig/framework-engine` dual-registry duplication is flagged above
  but not resolved.

## Batch 5 — Learning + Career Agents

### Scope

Wire the two agents named in the mission (Learning Path Agent, Career Portfolio Agent) into
the same runtime/governance/audit path as Batches 2D and 3, as orchestration layers only. No
learning, lab, assessment, certification, or portfolio engine was modified or duplicated; no
new agent id was registered, and the shared `orchestrateDomainAgent()` helper from Batch 3
was imported rather than re-implemented.

### New package

| Package | Role | Wraps / extends |
|---|---|---|
| `@zig/agent-learning-career` | Two agent handlers (Learning Path, Career Portfolio) | `@zig/adaptive-learning`, `@zig/assessment-engine`, `@zig/learning-paths`, `@zig/career-os`, `@zig/credentials`, `@zig/agent-domain-intelligence` (for the shared orchestration helper), `@zig/agent-runtime`, `@zig/agent-governance`, `@zig/agents` |

### Design decisions

- **Reused the existing `"learning"` agentRegistry entry** for the Learning Path Agent — no
  registration change needed; `"learning"` already exists with exactly the right
  capabilities (`study_plans`, `skill_gap_analysis`) and no `execute:*` permission, matching
  "the agent recommends, it never finalizes."
- **No dedicated "career"/"portfolio" agent or RBAC resource exists.** Rather than adding a
  13th `AgentKey` and a new `RbacResource` member (which the mission's "do not rebuild" /
  reuse-first pattern argues against unless a clear gap is documented), the Career Portfolio
  Agent reuses the existing `"certification"` agentId (semantically the closest: "Forecast
  certification readiness" already overlaps heavily with portfolio readiness scoring) and
  the existing `"learning"` RBAC resource (same Academy domain bucket). This is a
  documented reuse decision, not a silent assumption — recorded in
  `docs/agents/ZIG_AGENT_PERMISSION_MATRIX.md`'s Batch 5 section. Adding a real "career"
  resource/agent remains an option for a future batch if the reuse proves too coarse-grained
  in practice.
- **Reused `orchestrateDomainAgent()` by import, not by copy.** Since the helper introduced
  in Batch 3 (`packages/agent-domain-intelligence/src/shared.ts`) is already fully generic
  over agent id / resource / approval action / produce / toDecision, Batch 5 depends on
  `@zig/agent-domain-intelligence` directly rather than duplicating the same ~50 lines of
  runtime/governance wiring into a second package.
- **`readiness_scoring` approval is set conditionally, not statically.** Unlike the Policy
  Artifact Agent (Batch 3), which always sets `approvalAction: "policy_finalization"`
  regardless of its recommendation, the Career Portfolio Agent only passes
  `approvalAction: "readiness_scoring"` when the caller's input explicitly requests
  publish/official-readiness/export (`input.requestPublish`). This is a deliberate
  refinement: the mission's approval rules are about *publishing*, not *drafting*, so most
  Career Portfolio runs (ordinary progress-triggered drafts) correctly never touch the
  approval gate.
- **Learning Path Agent never requires approval.** It has no publish-style action in its
  vocabulary — every action is a draft recommendation — so no `approvalAction` is ever
  passed.

### What was proven end-to-end (×2)

```
domain event -> orchestrateDomainAgent() (imported) -> registry resolution
  -> governance check -> runtime execution -> existing domain engine(s)
  -> decision persistence -> audit trail
```

19 tests total (9 for Learning Path Agent, 10 for Career Portfolio Agent), covering per
agent: happy path, a failed-assessment/low-readiness remediation path, a
framework-alignment/skill-mapping path, tenant isolation, RBAC denial stopping execution,
audit logging, replay of a denied/failed run back to `queued`, explainability
(reason/dataUsed/confidence present), and an approval-path check (Learning Path Agent
asserts approval is never required; Career Portfolio Agent asserts both the
publish-approval-required case and the publish-requested-but-not-ready case).

### Validation

- `npm run typecheck --workspace @zig/agent-learning-career` (`tsc --noEmit`) — clean.
- `npm run test --workspace @zig/agent-learning-career` — both suites `[PASS]`
  (`learning-path`, `career-portfolio`).
- `npm run lint --workspace web` — clean.
- `npm run build --workspace web` and `npm run build --workspace admin` — both succeed.

### Explicitly deferred (per "STOP HERE. Do not implement Governance Supervisor Agent or
Agent SOC yet.")

- Governance Supervisor Agent and Agent SOC are not implemented.
- Readiness Scoring, Remediation, and Reporting agents (named in the still-queued Batch 4
  prompt) remain unimplemented.
- Admin-tower UI wiring for the Batch 5 agents' runs/decisions/approvals into a live screen
  (learning dashboard, module pages, lab workflow, assessment review, career portfolio page,
  readiness page) is not done — the agents' output shapes are ready for it, but no UI route
  was added or changed in this batch, consistent with every prior batch's deferral.
- The dedicated "career"/"portfolio" agent id and RBAC resource gap (reuse decision above)
  is flagged but not resolved with new registrations.

## Batch 4 — Execution Layer Agents

### Scope

Wire the three Execution Layer agents named in the mission (Readiness Scoring, Remediation,
Reporting) into the same runtime/governance/audit path proven in every prior batch, as
orchestration layers only. The mission explicitly framed this batch as turning existing
intelligence into action, readiness, and outputs — not additional intelligence — so no new
scoring/domain engine was written; aggregation/mapping logic lives in the agent only where
the underlying numbers all originate from existing, unmodified engines.

### New package

| Package | Role | Wraps / extends |
|---|---|---|
| `@zig/agent-execution` | Three agent handlers (Readiness Scoring, Remediation, Reporting) | `@zig/frameworks`, `@zig/controls`, `@zig/certification-readiness`, `@zig/risks`, `@zig/evidence`, `@zig/board-reporting`, `@zig/agent-domain-intelligence` (for the shared orchestration helper), `@zig/agent-runtime`, `@zig/agent-governance`, `@zig/agents` |

### Design decisions

- **Reused three existing `agentRegistry` entries** — `"assessment"` (Readiness Scoring,
  capability literally named `readiness_scoring`), `"audit"` (Remediation, permission
  literally `recommend:remediation`), `"executive"` (Reporting, capability `board_reporting`)
  — no new agent id was registered. Tool names follow the existing `${agentId}-engine`
  convention auto-derived by `packages/agents/src/index.ts`'s `toAgentDefinition()`
  (`assessment-engine`, `audit-engine`, `executive-engine`).
- **Readiness Scoring Agent aggregates, it does not score.** Per the mission's explicit "do
  not create a new scoring engine" instruction, the agent calls three existing engines
  (`FrameworkIntelligenceEngine.score()`, `ControlManagementEngine.assess()`,
  `CertificationReadinessEngine.score()`) plus the caller's raw `organizationalMaturity`
  number (no existing engine models generic organizational maturity), then computes a simple
  arithmetic mean across the four dimension scores inside the agent. This is treated as
  permissible aggregation, not a new scoring engine, because every individual dimension's
  score still originates entirely from an existing, unmodified domain engine.
- **No standalone "tasks" engine package exists in the repo.** A repo-wide check
  (`ls packages | grep -iE "task"`) found no `tasks` package. Per the mission's "reuse
  existing task infrastructure if present," since none exists, the Remediation Agent's
  output is a structured recommendation shape (priority, owner, effort estimate, due date,
  dependencies) rather than a persisted task record — a documented gap, not a violation.
- **`approvalAction` is decided before `produce()` runs, for all three agents**, following
  the Batch 5 Career Portfolio Agent pattern: because `orchestrateDomainAgent()`'s governance
  check happens strictly before the agent's `produce()` callback executes, the approval
  decision can only depend on the input, never on the recommendation's own output. Readiness
  Scoring keys off `input.requestPublish`; Remediation precomputes a risk band via
  `RiskManagementEngine.score()` and keys off whether that band is critical/high; Reporting
  keys off `input.isOfficial`.
- **`BoardReportingEngine.manifest()`'s `requiresApproval: true` is informational, not the
  governance gate.** That field is a fixed type-level fact on every manifest the engine
  produces, regardless of content. The Reporting Agent surfaces it as narrative content in
  the rationale; the actual governance-level approval gate is the separate, conditional
  `approvalAction: "report_generation"` driven by `input.isOfficial`.
- **`@zig/approvals` and `@zig/agent-approvals` were reviewed but not wired in.** Both are
  candidate "existing approval framework" implementations the mission references for
  "create approval requests through existing approval framework," but neither package is
  directly instantiated by any Batch 4 agent. `AgentGovernanceGuard`'s
  `requiresApproval`/`escalationTarget` signaling — already the approval mechanism every
  prior batch has relied on — is treated as satisfying that requirement, since it already
  logs every approval-required decision via `listLog()`. Flagged as a documented design
  decision, consistent with how prior batches flagged similar reuse-vs-build tradeoffs.

### What was proven end-to-end (×3)

```
domain event -> orchestrateDomainAgent() (imported) -> registry resolution
  -> governance check -> runtime execution -> existing domain engine(s)
  -> decision persistence -> audit trail
```

25 tests total (9 for Readiness Scoring Agent, 8 for Remediation Agent, 8 for Reporting
Agent), covering per agent: happy path, failure path, tenant isolation, RBAC denial stopping
execution, audit logging, replay of a denied/failed run back to `queued`, explainability
(reason/dataUsed/confidence present), and an approval-path check (Readiness Scoring and
Reporting also assert a "requested but not ready/non-official" negative case alongside the
approval-required case).

### Validation

- `npx tsc -p packages/agent-execution/tsconfig.json --noEmit` (`tsc --noEmit`) — clean.
- `npm run test --workspace @zig/agent-execution` — all three suites `[PASS]`
  (`readiness-scoring`, `remediation`, `reporting`).
- `npm run lint --workspace web` — clean.
- `npm run build --workspace web` and `npm run build --workspace admin` — both succeed.

### Explicitly deferred (per "STOP HERE. Do not implement: Learning Path Agent, Career
Portfolio Agent, Governance Supervisor Agent, Agent SOC.")

- Governance Supervisor Agent and Agent SOC are not implemented.
- Admin-tower UI wiring for the Batch 4 agents' runs/decisions/approvals into a live screen
  (readiness dashboard, remediation/task views, report generation history) is not done — the
  agents' output shapes are ready for it, but no UI route was added or changed in this batch,
  consistent with every prior batch's deferral.
- `@zig/approvals` and `@zig/agent-approvals` remain unwired (reviewed, documented, not
  adopted in favor of the existing `AgentGovernanceGuard` mechanism) — flagged above as a
  design decision, not an oversight.
- `@zig/exports`' `ExportPipeline` (the most direct match for the mission's "external
  exports" approval trigger) was reviewed but not adopted; "external export" is currently
  folded into the Reporting Agent's existing `isOfficial` flag rather than modeled as a
  separate pipeline call. Worth reconsidering in a future batch if export-specific staging
  (request/authorize/generate/audit/download/archive) proves necessary.

## Batch 6 — Governance Supervisor Agent + Agent SOC

### Scope

Implement the Governance Supervisor Agent (meta-agent over existing run/governance/audit
records), Agent SOC health/telemetry, policy violation monitoring, and replay/recovery
visibility — per `ZIG_AGENT_SUPERVISOR.md` and `ZIG_AGENT_SOC.md`. No new domain agent was
created; no registry, runtime, Event Fabric, governance guard, or `RbacEngine` code was
modified or duplicated.

### Extended package (not new)

| Package | Role | Wraps / extends |
|---|---|---|
| `@zig/supervisor-agents` | `GovernanceSupervisorAgent` (8 detectors + `supervise()`), `computeAgentSocHealth()` | `@zig/agent-runtime`, `@zig/agent-governance`, `@zig/runtime-persistence` |

The package already existed as a 6-line stub (`SupervisorAgent` type +
`SupervisorAgentPlatform.supervisors()`); both are preserved unchanged. This is the one
package in Batches 2–6 that was extended in place rather than created fresh, since the
mission's "extend existing infrastructure" instruction applied directly to it.

### Design decisions

- **No 13th agent id.** The supervisor is not registered in `agentRegistry` and never goes
  through `AgentRuntime.submit()`/`orchestrateDomainAgent()`. It is pure analysis tooling over
  records those paths already produce.
- **Approval-bypass detection unified** across the mission's five separately-named flags
  (approval bypass; rejected evidence without approval; readiness publication without
  approval; official report without approval; policy finalization without approval) into one
  `detectApprovalBypass()` detector, via generic substring matching on `decision.action`
  (`FINALIZING_ACTION_PATTERNS`). See `ZIG_AGENT_SUPERVISOR.md` for the rationale.
- **`overrideCount` redefined during implementation.** The naive reading
  (`outcome === "policy_violation" && result.allowed`) is logically impossible given
  `AgentGovernanceGuard`'s outcome-derivation rule (`policy_violation` outcome only occurs when
  `allowed === false`). Corrected to `result.policyViolations.length > 0 && result.allowed`,
  which models the intended case (a flagged violation that was still allowed through, i.e. an
  override) without contradicting the guard's own invariants.

### What was proven end-to-end

11 assertions in `packages/supervisor-agents/src/tests/governance-supervisor.test.ts` cover
every detector named in the mission's test list (unsafe action / missing-governance-check,
missing rationale, tenant context, failed-run escalation via `supervise()`, replay
recommendation, duplicate registration, approval bypass — positive and negative case), plus
missing-audit, unsupported-event-coverage, a clean/healthy `supervise()` run, and
`computeAgentSocHealth()`.

### Validation

- `npm run typecheck --workspace @zig/supervisor-agents` (`tsc --noEmit`) — clean.
- `npm run test --workspace @zig/supervisor-agents` — `[PASS]`, 11/11 assertions.

### Explicitly deferred (per "STOP HERE. Do not expand agent count.")

- Admin SOC/control-tower UI wiring: `/admin/agent-soc` still renders synthetic demo data
  unrelated to `AgentRuntime`/`AgentGovernanceGuard`/the new supervisor; the five other named
  routes (`/admin/agent-runs`, `/admin/agent-health`, `/admin/agent-approvals`,
  `/admin/agent-events`, `/admin/agent-replay`) do not exist. Output shapes are ready for a UI
  to consume — no UI route was added or changed in this batch, consistent with every prior
  batch's deferral. See `ZIG_AGENT_COVERAGE_REPORT.md`.
- No live Event Fabric subscription was wired for `agent.run.started` /
  `agent.run.completed` / `agent.failed` / `approval.required` /
  `policy.violation.detected` / `replay.requested` / `agent.decision.created` — `supervise()`
  is called with already-collected record slices rather than as a live event subscriber.
- This batch addresses only the concrete "Proceed with Batch 6 only" mission text. The
  separate, broader "Batch 1–6 Full Scope Completion Pass" audit (with its own required
  `ZIG_AGENT_FULL_IMPLEMENTATION_MATRIX.md` / `ZIG_AGENT_GAP_CLOSURE_REPORT.md` /
  `ZIG_BATCH_1_6_SCOPE_REVIEW.md` deliverables) was not undertaken in this batch.

## Trigger Automation + Admin Test Harness (this batch)

### New package

| Package | Role | Wraps / extends |
|---|---|---|
| `@zig/agent-trigger-automation` | `emitDomainEvent()` dispatcher over the 10 canonical `DomainEventType`s | All 9 existing `run*Agent()`/`reviewEvidence()` functions, plus `GovernanceSupervisorAgent.supervise()` for `agent.failed` |

No new agent logic, no new RBAC rule, no new runtime queue, no new persistence layer. The
package's only original code is: the `DomainEventType` union, the routing `switch` in
`emitDomainEvent()`, fixture defaults (`src/fixtures.ts`, `randomId()`-based, no hardcoded
production ids), and the `DomainEventEnvelope` wrapper (correlation id, timestamps,
tenant/org/user passthrough).

### What was proven end-to-end

12 integration tests (`packages/agent-trigger-automation/src/tests/*.test.ts`) — one per
`DomainEventType` (10) plus two extra fan-out proofs (`gap-detected-fanout.test.ts`,
`module-completed-fanout.test.ts`) — each confirms: dispatch resolves the correct agent
function(s), the underlying `AgentRuntime.submit()`/`execute()` and
`AgentGovernanceGuard.evaluate()` ran (except the documented `agent.failed` exception),
a decision with a rationale/confidence/action was produced, the run was persisted, both the
runtime and governance audit trails grew, and (where relevant) the approval flag surfaced
correctly — e.g. `gap.detected`'s remediation branch with a high-likelihood/impact risk
payload routes to `request_high_risk_approval` with `governance.requiresApproval === true`;
`module.completed`'s career-portfolio branch with `requestPublish: true` and high readiness
inputs routes to `request_portfolio_publish_approval` with the same flag set.

### Admin test harness

`/admin/agent-soc/test-triggers` (Platform-Owner-gated, same `requirePlatformOwner()` guard
as the rest of `apps/admin`) renders a 10-row panel, one per `DomainEventType`, each with a
"Fire Event" button backed by a `"use server"` action
(`apps/admin/app/admin/agent-soc/test-triggers/actions.ts`) that calls `emitDomainEvent()` —
never an agent handler directly. Each click builds a fresh in-memory
`AgentRuntime`/`AgentGovernanceGuard` and synthetic tenant/org/user ids (never production
ids), then displays the returned run id(s)/status/decision action and correlation id.

**Honest depth note**: this is a single-click manual test harness, not a live production
event console — there is no upstream production code yet that calls `emitDomainEvent()`
outside this panel and the package's own tests, and the panel does not persist results
across reloads or chain triggers together. See `ZIG_AGENT_TEST_TRIGGER_GUIDE.md` for the
full, undiluted depth statement.

### Validation

- `npx tsc -p packages/agent-trigger-automation/tsconfig.json --noEmit` — clean.
- `npm run test --workspace @zig/agent-trigger-automation` — 12/12 `[PASS]`.
- `npm run lint --workspace admin` — clean (one initial `no-explicit-any` finding in
  `actions.ts` was fixed by typing the summarizer's narrowed record shape instead of casting
  to `any`).
- `npm run build --workspace admin` — succeeds; `/admin/agent-soc/test-triggers` appears in
  the route manifest as a dynamic (`ƒ`) server-rendered route.
- `npm run lint --workspace web` / `npm run build --workspace web` — unaffected, both clean
  (this batch touches no `apps/web` files).

### Explicitly deferred

- No live production event emitter calls `emitDomainEvent()` yet outside the admin test panel
  and the package's own tests — wiring a real upstream trigger source (webhook, domain event
  bus, UI action) is out of scope for this batch.
- `agent.failed`'s supervisor path is exercised with synthetic `fixtureFailedRunRecord()`
  data in both the test suite and the admin panel; no live aggregation of real
  `AgentRunRecord`/`GovernanceDecisionLogEntry`/`RuntimeRecord` slices across the whole fleet
  is wired yet (that aggregation source did not exist before this batch either — see
  `ZIG_AGENT_SUPERVISOR.md`).
