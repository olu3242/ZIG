# ZIG Agent Implementation Report — Batches 2B–2D, 3

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

### Explicitly deferred (per "STOP. Do not implement Learning, Reporting, Career, or
Supervisor agents yet.")

- Learning Path, Reporting, Career Portfolio, and Governance Supervisor agents are not
  implemented.
- Readiness Scoring and Remediation agents (named in the queued Batch 4 prompt) are not
  implemented.
- Admin-tower UI wiring for the four Batch 3 agents' runs/decisions/approvals into a live
  screen is not done — same deferral as Batch 2D, carried forward.
- The `@zig/frameworks` / `@zig/framework-engine` dual-registry duplication is flagged above
  but not resolved.
