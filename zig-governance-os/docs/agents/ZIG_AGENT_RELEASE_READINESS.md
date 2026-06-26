# ZIG Agent OS — Release Readiness (Go/No-Go)

## Decision: GO, with honestly bounded production trigger coverage

This branch (`feature/zig-agent-os-live-wiring`, backing PR #5) is ready for human review.
All validation commands pass clean, all 10 canonical trigger paths plus their 2 fan-out
cases are proven end to end via the dispatcher's own tests, and every known gap is
explicitly documented (not hidden, not blocking the agent-OS framework itself).

**Production trigger coverage is 1/10** (`framework.selected`). This is a re-verified,
deliberate finding, not an oversight: of the 9 other domain pages in `apps/web`, every one
is either a read-only page over static MVP/demo fixtures (`evidence/page.tsx`,
`assessment/[id]/page.tsx`, `reports/page.tsx`, `learning/module/[id]/page.tsx`,
`labs/session/[id]/page.tsx`), a UI stub whose only button is `type="button"` with no
`formAction` (`risk/new/page.tsx`), a real call site fed by hardcoded constants instead of
live data (`gaps/page.tsx` — `GapAssessmentEngine.assess(type, 40, index + 3)`), or has no
real aggregation call site outside the admin test panel/test files (`agent.failed`). See
`ZIG_AGENT_TRIGGER_MAP.md`'s "Production wiring status" table for the per-trigger detail.

## Criteria checklist

| Criterion | Status |
|---|---|
| Every agent registry-resolves | PASS — 10/10 agents + meta-agent, proven in `ZIG_AGENT_COVERAGE_MATRIX.md` |
| Every agent flows through governance | PASS — `AgentGovernanceGuard.evaluate()` confirmed per agent; `agent.failed` exception documented |
| Every agent produces a decision | PASS |
| Every agent writes an audit record | PASS |
| Approval workflow wired where applicable | PASS — 5 of 10 agents have a finalizing approval action; rest are N/A by design (no finalizing action exists) |
| Replay available | PASS — inherited from `AgentRuntime.replay()`, proven per-package |
| Dispatcher layer (trigger automation) wired | PASS — 12/12 dispatcher tests `[PASS]`, typecheck clean |
| Admin test harness reachable | PASS — `/admin/agent-soc/test-triggers`, Platform-Owner-gated, builds clean, now labeled "Dev/Test Trigger Harness — not proof of production workflow wiring" |
| Admin SOC fleet health | PASS as PARTIAL — `/admin/agent-soc` computes real (non-synthetic) fleet health via `computeAgentSocHealth()` over a shared, process-local `AgentRuntime`/`AgentGovernanceGuard` pair; prominently banner-labeled in the UI itself as in-memory-only/resets-on-restart/not-cross-process |
| Production trigger coverage | PARTIAL — 1/10 (`framework.selected`); remaining 9 genuinely BLOCKED-NO-REAL-WORKFLOW or PARTIAL, not missing agent-OS capability |
| Lint clean (web, admin) | PASS |
| Build clean (web, admin) | PASS |
| Typecheck clean (agent-trigger-automation) | PASS |

## Known, accepted gaps (non-blocking)

1. **Production trigger coverage is 1/10.** The agent-OS dispatcher, runtime, governance,
   and admin surfaces are fully capable of carrying all 10 triggers; what's missing is
   upstream product mutation logic (real forms/actions/persistence) for the other 9 domain
   workflows. This is a product-workflow gap, not an agent-OS gap.
2. **Agent SOC fleet dashboard** (`/admin/agent-soc`) is real but process-local: in-memory
   only, resets on restart, not shared with the separate `apps/web` deployment. No
   Supabase-backed (or other durable) store exists yet for `AgentRunRecord`/
   `GovernanceDecisionLogEntry`, and building one is out of scope (would require new
   schema/migrations; this repo has no `supabase/migrations/` yet). Now prominently
   labeled in the UI itself, not just in docs.
3. **No trigger chaining** — each of the 10 canonical events is dispatched independently.

None of these block review: they are scoped, honestly documented limitations, not
regressions or hidden defects.

## Recommendation

Leave PR #5 in draft for human review. Do not merge or mark ready-for-review
automatically — see `ZIG_AGENT_PR_SUMMARY.md` for the current PR title/body state.
