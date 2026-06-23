# ZIG Agent OS — Merge Readiness Review (`feature/zig-agent-os`)

## Branch / tree state

- Branch: `feature/zig-agent-os`.
- `git status --short`: clean (no untracked/uncommitted changes at review time).
- 10 commits ahead of the pre-agent-OS baseline (`6632388` Phase 1 audit through `7359db4`
  Batch 6), one commit per batch, no merge commits, no force-pushes.
- No secrets, `.env` files, keys, or migrations are present in any commit's diff — confirmed
  via `git diff <baseline>..HEAD --name-only` filtered for migration/secret patterns (no
  matches). This repo has no `supabase/migrations/` content yet (app code is pre-Fable-1 per
  the root `CLAUDE.md` status table), so "migrations are intentional" is vacuously true: there
  are none.
- All `package.json` changes are intentional and scoped: each new agent package declares only
  the existing workspace packages it orchestrates (`@zig/agents`, `@zig/agent-runtime`,
  `@zig/agent-governance`, plus the relevant domain package) — no new third-party
  dependencies were introduced anywhere in the agent OS work.

## Validation commands run (npm, not pnpm — see note)

> This repo uses **npm workspaces** (`package-lock.json`, root `workspaces` field), not pnpm.
> The pnpm-flavored commands requested in mission text are executed here as their npm
> equivalents; this substitution has been consistent across every batch in this effort.

| Command | Result |
|---|---|
| `npm run lint --workspace web` | Clean |
| `npx tsc -p <pkg>/tsconfig.json --noEmit` for `agents`, `agent-runtime`, `agent-governance`, `agent-evidence-review`, `agent-domain-intelligence`, `agent-learning-career`, `agent-execution`, `supervisor-agents`, `runtime-persistence`, `runtime-queue`, `agent-ingestion` | Clean (no errors) on all 11 packages |
| `npm run test --workspace @zig/agent-runtime` | `[PASS]` |
| `npm run test --workspace @zig/agent-governance` | `[PASS]` |
| `npm run test --workspace @zig/agent-evidence-review` | `[PASS]` |
| `npm run test --workspace @zig/agent-domain-intelligence` | `[PASS]` ×4 (framework-mapping, risk-assessment, control-advisor, policy-artifact) |
| `npm run test --workspace @zig/agent-learning-career` | `[PASS]` ×2 (learning-path, career-portfolio) |
| `npm run test --workspace @zig/agent-execution` | `[PASS]` ×3 (readiness-scoring, remediation, reporting) |
| `npm run test --workspace @zig/supervisor-agents` | `[PASS]`, 11/11 assertions |
| `npm run build --workspace web` | Succeeds |
| `npm run build --workspace admin` | Succeeds |

Total automated test count across the agent OS work: **~83 assertions** (8 runtime + 7
governance + 10 evidence-review + 28 domain-intelligence + 19 learning-career + 25 execution +
11 supervisor — see each batch's section in `ZIG_AGENT_IMPLEMENTATION_REPORT.md` for exact
per-suite counts).

## Scope confirmation checklist

| Item | Status | Evidence |
|---|---|---|
| Batch 1–6 docs exist | YES (Batch 7 was never separately scoped as a doc-bearing batch in this effort — see "Known limitations") | `docs/agents/ZIG_AGENT_GAP_REPORT.md`, `ZIG_AGENT_SCOPE_MAP.md`, `ZIG_AGENT_CORE_DECISION.md`, `ZIG_AGENT_RUNTIME.md`, `ZIG_AGENT_PERMISSION_MATRIX.md`, `ZIG_AGENT_EVENT_CATALOG.md`, `ZIG_AGENT_WORKFLOW_MAP.md`, `ZIG_AGENT_SAFETY_MODEL.md`, `ZIG_AGENT_IMPLEMENTATION_REPORT.md`, `ZIG_AGENT_SUPERVISOR.md`, `ZIG_AGENT_SOC.md`, `ZIG_AGENT_COVERAGE_REPORT.md` |
| Implementation matches documented scope | YES | Each batch's design decisions in `ZIG_AGENT_IMPLEMENTATION_REPORT.md` are reflected 1:1 in the corresponding package's source and tests; no undocumented agent or route exists. |
| No scoped agent is silently partial | YES, with explicit exceptions documented | All 12 `agentRegistry` entries resolve; every named agent across Batches 2–6 (Evidence Review, Framework Mapping, Risk Assessment, Control Advisor, Policy Artifact, Readiness Scoring, Remediation, Reporting, Learning Path, Career Portfolio, Governance Supervisor) has a working handler + tests. Partial areas are named explicitly (not silently) in each batch's "Explicitly deferred" section — see "Known limitations" below. |
| No duplicate registry/runtime/RBAC introduced | YES | Every batch reused the single Phase 2A `agentRegistry`, the single `AgentRuntime`, the single `AgentGovernanceGuard`, and the single `RbacEngine`. The one duplicate-registry-shaped risk identified (`@zig/frameworks` vs `@zig/framework-engine`) is a **pre-existing** dual registry, not one introduced by this work — flagged, not created, in Batch 3. |
| All agents route through runtime | YES | Every agent handler is invoked via `orchestrateDomainAgent()` (Batches 3/5/4) or `reviewEvidence()` (Batch 2D), both of which call `AgentRuntime.submit()`/`execute()` — no handler is ever invoked directly. |
| Governance guard runs before execution | YES | `orchestrateDomainAgent()`/`reviewEvidence()` call `AgentGovernanceGuard.evaluate()` before the runtime executes the recommendation handler; a denial short-circuits to a `failed`, audited run with no recommendation produced — enforced and tested in every batch. |
| Approval gates exist for risky/final actions | YES | `requiresApproval`/`approvalAction` wired for: evidence rejection, policy finalization, readiness/report publication, high-risk remediation — see `ZIG_AGENT_PERMISSION_MATRIX.md` and each batch's approval-path tests. |
| Audit/explainability records persist | YES | Every run is persisted via `RuntimePersistence`; every decision carries `reason`/`dataUsed`/`confidence`/`frameworkReference` per `AgentDecision`; `AgentGovernanceGuard.listLog()` independently logs every evaluation. |
| Replay/failure handling exists | YES | `AgentRuntime` retries failed runs up to a ceiling then marks `dead_letter`; every batch's tests include a replay-of-denied/failed-run-back-to-`queued` assertion. Batch 6 adds `detectExcessiveRetries()`/`replayRecommended` as a supervisory recommendation layer on top. |
| Agent SOC visibility exists | PARTIAL | The data/analysis layer exists and is tested (`GovernanceSupervisorAgent`, `computeAgentSocHealth()`); the admin UI surfaces (`/admin/agent-soc` and 5 named-but-missing routes) are **not** wired to this real data yet — explicitly documented as deferred in `ZIG_AGENT_SOC.md` and `ZIG_AGENT_COVERAGE_REPORT.md`, not silently dropped. |
| Validation results documented | YES | This document + `ZIG_AGENT_COVERAGE_REPORT.md` + each batch's "Validation" section in `ZIG_AGENT_IMPLEMENTATION_REPORT.md`. |

## Known limitations (carried forward, not silently dropped)

1. **Admin UI is not wired to real agent-runtime data.** `/admin/agent-soc` renders synthetic
   demo content from unrelated packages; `/admin/agent-runs`, `/agent-health`,
   `/agent-approvals`, `/agent-events`, `/agent-replay` do not exist. This has been deferred
   consistently since Batch 2D and is the single largest remaining gap before "Agent SOC
   visibility" is fully real rather than data-ready.
2. **No live Event Fabric subscription wires the Governance Supervisor to
   `agent.run.started`/`agent.failed`/etc. in real time** — `supervise()` operates on
   already-collected record slices, not a push subscription.
3. **`@zig/frameworks` / `@zig/framework-engine` dual registry** predates this effort and was
   flagged, not resolved, in Batch 3.
4. **No dedicated "career"/"portfolio" `AgentKey` or RBAC resource** — the Career Portfolio
   Agent reuses `"certification"`/`"learning"`, a documented reuse decision (Batch 5), not a
   silent gap.
5. **No standalone "tasks" engine** — the Remediation Agent returns structured recommendation
   data rather than a persisted task record, since no tasks package exists in the repo
   (Batch 4).
6. **`@zig/approvals` / `@zig/agent-approvals` reviewed but not adopted** — approval gating is
   handled entirely through `AgentGovernanceGuard`'s `requiresApproval`/`escalationTarget`
   signaling (Batch 4 design decision).
7. **The separate "Batch 1–6 Full Scope Completion Pass" audit deliverables**
   (`ZIG_AGENT_FULL_IMPLEMENTATION_MATRIX.md`, `ZIG_AGENT_GAP_CLOSURE_REPORT.md`,
   `ZIG_BATCH_1_6_SCOPE_REVIEW.md`) were never produced as a separate pass — this Merge
   Readiness Review and `ZIG_AGENT_COVERAGE_REPORT.md` are the closest equivalent artifacts
   produced in this effort.
8. **No formal "Batch 7 — E2E Certification + Coverage Hardening" pass has occurred.** This
   review is the closest thing to it but is scoped as "verify and document," not "add E2E
   coverage." Any net-new E2E test infrastructure (e.g. a trigger/automation harness) is
   out of scope for a merge-readiness pass and should be a follow-up PR, not part of this one.

## Risk notes for reviewers

- **Biggest risk: admin visibility gap.** Anyone testing this PR by clicking through
  `/admin/agent-soc` will see demo data, not real agent telemetry — this is expected, not a
  bug, but is the most likely source of reviewer confusion if not called out up front.
- **Approval-bypass detection is intentionally generic** (substring matching on
  `decision.action` rather than per-agent action unions) — a future agent whose finalizing
  action name doesn't match `FINALIZING_ACTION_PATTERNS` would silently evade this specific
  detector. Low risk today (all 13 current finalizing actions are covered) but worth a
  reviewer's attention if more agents are added later.
- **No production data or migrations are touched** — this PR is purely additive packages,
  docs, and tests; reverting it is a clean revert with no data-shape consequences.

## Recommended reviewer focus areas

1. `packages/agent-governance/src/index.ts` and `packages/agent-runtime/src/index.ts` — the
   two pieces every other package depends on; any defect here is systemic.
2. `packages/supervisor-agents/src/index.ts` — newest, least-reviewed code; in particular the
   `overrideCount` semantics and `FINALIZING_ACTION_PATTERNS` substring list.
3. `docs/agents/ZIG_AGENT_PERMISSION_MATRIX.md` against each agent's actual `approvalAction`
   wiring, to confirm no risky action is missing its gate.
4. The "Explicitly deferred" section of each batch in `ZIG_AGENT_IMPLEMENTATION_REPORT.md`, to
   confirm no deferral was actually required for safety (vs. UI convenience).
