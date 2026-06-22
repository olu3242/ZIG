# ZIG Agent Implementation Report — Batches 2B–2D

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

## Explicitly deferred (per "stop here")

- Framework Mapping, Risk Assessment, Control Advisor, Policy Artifact, Readiness Scoring,
  Remediation, Reporting, Career Portfolio, and Governance Supervisor agents are not wired to
  the runtime/governance layer yet — only the `"evidence"` agent is.
- Admin-tower UI wiring of `listAuditTrail()`/`listLog()` into a live screen is not done —
  the data shapes are ready for it, but no UI route was added or changed in this batch.
- `readiness_scoring`, `report_generation`, `policy_finalization`, `admin_action`,
  `high_risk_recommendation` approval actions are defined in the permission matrix but have
  no agent wired to trigger them yet.
