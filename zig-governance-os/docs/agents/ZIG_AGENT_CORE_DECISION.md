# ZIG Agent Core Decision — Phase 2A

## What existed

Two structurally incompatible agent registries:

- **`packages/agents`** — `AgentOperatingSystem` over `AgentProfile[]` (`agentRegistry`). Behavioral
  model: `key`, `name`, `mission`, `skills`, `permissions`, `lifecycle`, plus `plan()` for
  goal/stage planning. Already covered all 12 ZIG agent keys. Consumers: `apps/web/app/agents/page.tsx`,
  `apps/web/app/compliance-command-center/page.tsx`, `apps/admin/app/agents/page.tsx` (3 sites).
- **`packages/agent-registry`** — `AgentRegistry.inventory()` over a hand-written `GovernedAgent[]`
  (3 example rows: a learning, a risk, and an automation agent). Operational/governance shape:
  `owner`, `department`, `supervisor`, `tools`, `status`, `version`, `certificationLevel`. Consumer:
  `apps/admin/app/admin/agent-control-tower/page.tsx` (1 site, but the heaviest single consumer —
  computes health scores and approval levels from the data).

## What was chosen

**Canonical registry: `packages/agents`.** Criteria:

- **Current usage**: 3 real import sites vs. 1.
- **Type completeness**: richer behavioral model (mission, skills, lifecycle stages, `plan()`)
  vs. `agent-registry`'s flatter operational metadata.
- **Runtime compatibility**: already enumerates all 12 canonical `AgentKey` values the mission
  requires; `agent-registry` only modeled 3 examples.
- **Migration risk**: extending the 1-consumer package's internals is lower-risk than rewriting
  the 3-consumer package's internals.
- **Future extensibility**: `AgentLifecycleStage` + `plan()`'s approval logic (`requiresApproval`
  on `execute`) is a more natural foundation for Phase 2B/2C runtime and governance wiring than
  `GovernedAgent`'s static metadata shape.

## What was deprecated

No public export of `packages/agent-registry` was removed. `AgentCategory`, `AgentOperationalStatus`,
`GovernedAgent`, and `AgentRegistry.inventory()` are unchanged in shape and signature. What was
deprecated is **only the internal hardcoded 3-row dataset** — `AgentRegistry.inventory()` now derives
its data from the canonical `agentDefinitions` in `@zig/agents` instead of hand-written examples.

## What remains compatible

All 4 existing import sites compile and build unmodified:

- `apps/web/app/agents/page.tsx`, `apps/web/app/compliance-command-center/page.tsx`,
  `apps/admin/app/agents/page.tsx` — unaffected; they import `AgentOperatingSystem` from
  `@zig/agents`, which is untouched.
- `apps/admin/app/admin/agent-control-tower/page.tsx` — imports `AgentRegistry`/`GovernedAgent`
  from `@zig/agent-registry`; the import and the methods/fields it uses are unchanged. The
  **displayed data changes** (now 12 real agents instead of 3 examples, so health/approval
  numbers shift) — this is a disclosed, intended consequence of reconciliation, not a break.
  Verified via `npm run build --workspace admin` (compiles, all 21 routes generate, including
  this page).

`packages/agents/src/index.ts` gained additive-only types and exports: `AgentId`, `AgentCapability`,
`AgentPermission`, `AgentOperationalStatus`, `AgentToolAccess`, `AgentContext`, `AgentDecision`,
`AgentRunInput`, `AgentRunOutput`, `AgentDefinition`, `agentDefinitions`, `registerAgent`,
`getAgentById`, `getAgentsByCapability`, `getAgentsByEventType`. The original `AgentKey`,
`AgentLifecycleStage`, `AgentProfile`, `AgentActionPlan`, `agentRegistry`, `AgentOperatingSystem`
are unchanged.

`AgentEventType` is reused as-is from `@zig/agent-ingestion` rather than redefined. Each
`AgentDefinition`'s `eventTypes` are derived from whether the agent holds an `execute:*`
permission (the only existing signal that distinguishes action-executing agents from advisory
ones): execution-capable agents (currently only `automation`) subscribe to the full
approve/reject/suspend/recover lifecycle; advisory agents subscribe to
start/complete/fail/escalate only. This is a deliberately conservative Phase 2A placeholder —
domain-specific business triggers (e.g. `evidence.uploaded`, `control.failed`) are a distinct,
not-yet-wired vocabulary, addressed starting in Phase 2B/2C.

## What Phase 2B+ should connect next

- Wire `@zig/agent-ingestion` → `@zig/runtime-queue` → `@zig/runtime-persistence` so every
  agent run produces real `agent_runs`/`agent_decisions`/`agent_tasks`/`agent_approvals` records
  (existing tables; see `supabase/migrations/202606180006_production_convergence.sql`), with
  retry/failure/replay support.
- Wrap execution with a governance guard over the existing `RbacEngine`
  (`packages/governance-engine/src/rbac/RbacEngine.ts`) rather than reimplementing permission
  checks.
- Prove the full path with one vertical slice — the Evidence Review Agent (`AgentKey: "evidence"`)
  — before scaling to the remaining 11 agents.

## Validation

- `npx tsc -p tsconfig.json --noEmit` clean for `@zig/agents` and `@zig/agent-registry`.
- `npx tsx packages/agents/src/tests/registry.test.ts` → `[PASS]`.
- `npx tsx packages/agent-registry/src/tests/compatibility.test.ts` → `[PASS]`.
- `npm run lint --workspace web` clean.
- `npm run build --workspace web` and `npm run build --workspace admin` succeed.
