# ZIG Agent OS — Live Domain Trigger Wiring + Admin SOC/Run-History Views

This batch (`feature/zig-agent-os-live-wiring`) does two things, both purely additive on top
of the trigger automation layer documented in `ZIG_AGENT_TRIGGER_MAP.md`,
`ZIG_AGENT_COVERAGE_MATRIX.md`, `ZIG_AGENT_FINAL_READINESS.md`, and
`ZIG_AGENT_RELEASE_READINESS.md`:

1. Wires the one real (non-test, non-demo) application call site found in `apps/web` to
   `emitDomainEvent()`.
2. Replaces the synthetic/demo `/admin/agent-soc` dashboard with a live view over real,
   accumulated `AgentRunRecord`/`GovernanceDecisionLogEntry` data, and adds a new
   `/admin/agent-soc/runs` per-agent run-history view.

No agent logic, RBAC rule, runtime queue, or audit path was changed. No existing business
logic was altered — every change either adds a new file or adds an additive, try/catch-guarded
call alongside existing code.

## Task 1 — Real production callers

### What got wired

**`framework.selected`** — `apps/web/app/onboarding/actions.ts`, function
`emitFrameworksSelectedEvent()`, called from `frameworksSetupAction()` (the real onboarding
step at `/onboarding/frameworks` where a new user selects the frameworks they care about).
This is the only screen in `apps/web` that performs a real, persisted, request-scoped mutation
that semantically matches one of the 10 canonical `DomainEventType`s. It already had real
`tenantId` (from the `zig_tenant_id` cookie, set earlier in onboarding by
`organizationSetupAction()`) and `userId` (`session.userId`) in scope.

The wiring fires one `framework.selected` event per framework code the user selected, via a
new shared helper:

- `apps/web/app/lib/agent-os.ts` — `dispatchDomainEvent()`, `webAccessSubject()`,
  `getWebAgentRuntime()`, `getWebAgentGovernanceGuard()`. Mirrors the exact construction
  pattern already used by the admin test-trigger panel
  (`apps/admin/app/admin/agent-soc/test-triggers/actions.ts`): one `AgentRuntime` +
  `AgentGovernanceGuard` pair, built lazily and reused across requests within the `apps/web`
  process (rather than the admin panel's pre-this-batch pattern of a fresh, throwaway pair per
  call — see Task 2 for why that mattered there too).
- `dispatchDomainEvent()` wraps `emitDomainEvent()` in try/catch; on failure it
  `console.error`s `"[AGENT-OS]" dispatch failed for "<event>"` and returns normally. A
  governance/agent-runtime failure can never block or throw out of `frameworksSetupAction()`'s
  primary job (persisting the user's framework picks and redirecting to the next onboarding
  step).

`apps/web/package.json` gained four new workspace dependencies to make this possible:
`@zig/agent-trigger-automation`, `@zig/agent-runtime`, `@zig/agent-governance`,
`@zig/governance-engine`. None of these existed in `apps/web`'s dependency graph before this
batch.

### What did NOT get wired, and why (honest, not creative)

The remaining 9 events were investigated against `apps/web` and the business packages it
imports (`@zig/evidence`, `@zig/risks`, `@zig/controls`, `@zig/frameworks`,
`@zig/assessment-engine`, `@zig/board-reporting`, `@zig/learning-paths`, `@zig/career-os`,
`@zig/practice-lab`, etc.). The relevant pages all exist, but every one of them is a
**read-only display surface over static MVP/demo data fixtures**
(`apps/web/app/lib/mvp-data.ts`), consistent with the project's "Zero empty states" rule —
they were built to never render blank, not to perform real mutations yet:

| Event | Page checked | Why no real call site exists |
|---|---|---|
| `evidence.uploaded` | `apps/web/app/evidence/page.tsx` | Lists `evidenceTemplates` (static fixture array). No upload form, no server action, no API route mutates evidence. |
| `risk.created` | `apps/web/app/risk/new/page.tsx` | Renders a risk-intake `<form>`, but the "Save draft risk" button is `type="button"` with no `formAction` or `onClick` — it is visually complete but functionally a no-op. |
| `risk.scored` | (same risk surfaces) | No scoring mutation path exists; risk scoring logic exists in `packages/agent-domain-intelligence` but nothing in `apps/web` calls it for a real risk record. |
| `gap.detected` | `apps/web/app/gaps/page.tsx` | Calls `GapAssessmentEngine.assess()` with hardcoded literals (`40, index + 3`) purely to render a demo table; not a real, per-tenant gap detection event. |
| `assessment.completed` | `apps/web/app/assessment/[id]/page.tsx` | Looks up a static fixture by id from `assessments`; there is no submit/score/complete action. |
| `report.requested` | `apps/web/app/reports/page.tsx` | Static report catalog list; no "Generate"/"Request" action exists. |
| `module.completed` | `apps/web/app/learning/module/[id]/page.tsx` | Static `learningModules`/`lessons` fixture lookup; no completion action. |
| `lab.completed` | `apps/web/app/labs/session/[id]/page.tsx` | Static `lab.score`/`lab.deliverables` fixture; no real lab-runner completion action. |
| `agent.failed` | n/a (by design) | Bypasses `AgentRuntime.submit()` entirely per the documented exception in `ZIG_AGENT_TRIGGER_MAP.md` — `GovernanceSupervisorAgent.supervise()` inspects caller-supplied record slices. `apps/web` does not collect/aggregate `AgentRunRecord[]`/`GovernanceDecisionLogEntry[]` arrays anywhere, so there is no new real caller to add here distinct from the existing admin test panel. |

We did not fabricate UI, forms, or business logic to manufacture call sites for these 9 — per
the task's explicit instruction, that would not be honest wiring. `apps/web`'s broader CRUD
surface (`apps/web/app/lib/actions.ts`: `createProjectAction`, `createAssetAction`,
`createControlAction`, etc., backed by `apps/web/app/lib/lifecycle.ts`) is real and persists to
Supabase, but none of those actions map onto the 10 canonical `DomainEventType`s — they predate
and are outside the trigger-automation vocabulary (project/asset/control lifecycle, not
evidence/risk/assessment/report/learning/lab events).

## Task 2 — `/admin/agent-soc` live data

**Before**: `apps/admin/app/admin/agent-soc/page.tsx` rendered metrics from
`AgentRiskManager`, `AgentSelfHealingEngine`, `AgentAlerting`, `AgentChaos` over a hardcoded
`alerts` array — real threat-monitoring logic, but entirely synthetic/static threat data, with
zero connection to actual agent runs.

**After**: a new "Live Fleet Health" section calls `computeAgentSocHealth(runs, governanceLog)`
(`@zig/supervisor-agents`, unchanged) over real data from a new shared module:

- `apps/admin/app/admin/agent-soc/agent-os.ts` — `getAdminAgentRuntime()`,
  `getAdminAgentGovernanceGuard()` (lazily-constructed, process-local singletons — the key
  change from before this batch, where `test-triggers/actions.ts` built a **fresh**
  `AgentRuntime`/`AgentGovernanceGuard` pair on every single button click, so no run ever
  accumulated anywhere); `listAdminAgentRuns()` (derives the run list from
  `AgentRuntime.listAuditTrail()`, since `AgentRuntime` has no built-in "list all runs"
  accessor — only `getRun(id)`); `listAdminGovernanceLog()` (thin wrapper over
  `AgentGovernanceGuard.listLog()`).
- `apps/admin/app/admin/agent-soc/test-triggers/actions.ts` was changed to import and reuse
  `getAdminAgentRuntime()`/`getAdminAgentGovernanceGuard()` instead of constructing new
  instances per call. This is the load-bearing change that makes "live" actually mean
  something: fire a trigger from the Test Triggers panel, and its run now appears in both the
  SOC dashboard and the new run-history view, because they all read the same in-memory store.

Rendered fields, all read directly from `AgentSocHealthSnapshot`
(`packages/supervisor-agents/src/index.ts`): `runCount`, `successRate`, `failureRate`,
`averageLatencyMs`, `replayCount`, `approvalCount`, `overrideCount`, `policyViolationCount`,
`lastSuccessAt`.

**Honest limitation, stated on the page itself**: this is process-local, in-memory state.
- A fresh `apps/admin` process (new deploy, restart, or `next dev` reload) starts at zero —
  the page does not hardcode zeros; it genuinely reflects "no runs yet" until something
  dispatches through the shared runtime.
- It is **not shared with `apps/web`** — they are separate Next.js applications/deployments
  with separate Node processes, so `apps/web`'s `framework.selected` events (Task 1) do not
  appear in this admin view, and vice versa. True cross-process aggregation would require a
  durable, shared persistence layer (e.g. the `agent_runs`/`agent_decisions` tables referenced
  in `packages/agent-trigger-automation/src/index.ts`'s header comment, which do not exist as
  an actual database connection anywhere in this repo yet — `RuntimePersistence`
  (`packages/runtime-persistence`) only models the record shape in-process). Building that is
  explicitly out of scope for this batch and is the natural next increment.

## Task 3 — Per-agent run-history view

Checked `/admin/runtime` first (`apps/admin/app/admin/runtime/page.tsx`): it shows
tenant/user/audit-event counts sourced from Supabase via `loadPlatformRuntime()`
(`apps/admin/app/lib/platform-data.ts`) — a different data domain (platform tenancy, not agent
runs) and a different persistence backend (Supabase REST, not the in-memory `AgentRuntime`).
Extending it would have meant bolting an unrelated data source onto an unrelated page, so a new
route was added instead, consistent with `/admin/agent-soc` already being the agent-specific
section of the admin app.

**New route**: `apps/admin/app/admin/agent-soc/runs/page.tsx` (`/admin/agent-soc/runs`).
Shows, for each of the 11 agents (the 10 registry-resolved business `AgentId`s from
`@zig/agents`' `AgentKey` union, plus the Governance Supervisor meta-agent), a table of its
most recent 10 `AgentRunRecord`s: run id, status, started/completed timestamps, decision
summary (`action` + `confidence`, or the error message if failed), and the matching
`GovernanceDecisionLogEntry` (`allowed`/`requiresApproval`/policy violation count). Sourced
from the same `agent-os.ts` singletons as Task 2. The Governance Supervisor's row is always
empty by design and says so explicitly — it is not registry-resolved and does not submit a run
(see the `agent.failed` exception in `ZIG_AGENT_TRIGGER_MAP.md`); its own decision output is
visible instead in the Test Triggers panel's `agent.failed` result.

## Validation results

| Command | Result |
|---|---|
| `npm run lint --workspace web` | Clean |
| `npm run lint --workspace admin` | Clean |
| `npx tsc -p apps/web/tsconfig.json --noEmit` | Clean |
| `npx tsc -p apps/admin/tsconfig.json --noEmit` | Clean |
| `npx tsc -p packages/agent-trigger-automation/tsconfig.json --noEmit` | Clean (package untouched by this batch) |
| `npm run build --workspace web` | Succeeds; all existing routes plus the wired onboarding action build clean |
| `npm run build --workspace admin` | Succeeds; `/admin/agent-soc`, `/admin/agent-soc/runs`, `/admin/agent-soc/test-triggers` all present in the route manifest |
| `npm run test --workspace @zig/agent-trigger-automation` | 12/12 `[PASS]` — unchanged, this batch did not touch the package |

No pre-existing unrelated failures were observed during this batch's validation runs.

## Files touched

- `apps/web/package.json` — added `@zig/agent-trigger-automation`, `@zig/agent-runtime`,
  `@zig/agent-governance`, `@zig/governance-engine` dependencies.
- `apps/web/app/lib/agent-os.ts` — new. Shared singleton + `dispatchDomainEvent()` wrapper for
  `apps/web`.
- `apps/web/app/onboarding/actions.ts` — added `emitFrameworksSelectedEvent()`, called
  additively from `frameworksSetupAction()`.
- `apps/admin/app/admin/agent-soc/agent-os.ts` — new. Shared singleton +
  `listAdminAgentRuns()`/`listAdminGovernanceLog()` for `apps/admin`.
- `apps/admin/app/admin/agent-soc/test-triggers/actions.ts` — now reuses the shared singleton
  instead of constructing a fresh `AgentRuntime`/`AgentGovernanceGuard` per call.
- `apps/admin/app/admin/agent-soc/page.tsx` — added the "Live Fleet Health" section using
  `computeAgentSocHealth()`; existing threat-monitoring section unchanged.
- `apps/admin/app/admin/agent-soc/runs/page.tsx` — new per-agent run-history view.
- `docs/agents/ZIG_AGENT_TRIGGER_MAP.md`, `docs/agents/ZIG_AGENT_COVERAGE_MATRIX.md` — updated
  per above.
