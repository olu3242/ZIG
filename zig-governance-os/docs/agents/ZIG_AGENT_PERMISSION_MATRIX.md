# ZIG Agent Permission Matrix — Phase 2C / Batch 5

`AgentGovernanceGuard` (`packages/agent-governance`) wraps `RbacEngine`
(`packages/governance-engine/src/rbac/RbacEngine.ts`) — it does not replace or reimplement
role/resource/action checks. `can(subject, resource, action)` is called unmodified inside
`evaluate()`.

## Check order (first failure stops execution)

1. **Tenant scope** — `subject.user.tenantId === context.tenantId`.
2. **Role/resource/action** — delegated to `RbacEngine.can()`.
3. **Agent tool access** — `agent.toolAccess` must include the requested `tool`.
4. **Policy violations** — agent-specific rules (see below).
5. **Approval requirement** — only evaluated once 1–4 pass.

## Approval-required actions

| Approval action | Resource | Trigger |
|---|---|---|
| `evidence_rejection` | evidence | Finalizing a rejected evidence item |
| `readiness_scoring` | — | Publishing an official readiness score |
| `report_generation` | reports | Generating an executive/board report |
| `policy_finalization` | — | Finalizing a policy artifact |
| `admin_action` | — | Any admin-tower action an agent triggers |
| `high_risk_recommendation` | — | A recommendation above a defined risk threshold |

Phase 2D wires only `evidence_rejection` end-to-end (Evidence Review Agent). Batch 2C added
`policy_finalization` (Policy Artifact Agent, always required before publishing a drafted
artifact). Batch 5 adds the first conditional use of `readiness_scoring`: the Career
Portfolio Agent passes it only when the caller is requesting external
publication/certification-readiness-official status, not on every draft. The remaining rows
(`report_generation`, `admin_action`, `high_risk_recommendation`) are still reserved for
agents that adopt this guard in later batches.

## Policy violations enforced today

- `delete` actions without an `approvalAction` are always flagged — a destructive action must
  declare which approval rule governs it.
- `evidence_rejection` approval requests must target the `evidence` resource.

## Batch 5 — Learning + Career agents

| Agent | Reused `agentId` | Reused `RbacResource` | `tool` | `approvalAction` |
|---|---|---|---|---|
| Learning Path Agent | `"learning"` | `learning` | `learning-engine` | none — the agent only ever drafts recommendations, it never publishes or finalizes |
| Career Portfolio Agent | `"certification"` (closest existing match — no dedicated "career"/"portfolio" agent or RBAC resource exists) | `learning` (Academy domain; no dedicated "career"/"portfolio" resource exists in `RbacResource`) | `certification-engine` | `readiness_scoring`, but only when `input.requestPublish` is true |

Neither agent's id, nor the `RbacResource` union, was extended — both reuse what
`packages/agents`' registry and `RbacEngine` already define, per the "do not invent a 13th+
agent" rule carried from Batch 2D/3.

`Risk Manager` (and `Compliance Manager`/`Auditor`, which also have no `learning` key in
`RbacEngine`'s `rolePermissions`) is the correct RBAC-denial fixture for both Batch 5
agents — `Learner` is the correct allowed-role fixture, since `Learner` has
`learning: ["view", "create", "edit"]`.

### Approval semantics for the Career Portfolio Agent

The mission's approval rules ("publishing portfolio externally", "marking certification
readiness official", "exporting official proof-of-work", "claims that imply formal
certification") are all input-known *before* the recommendation is produced — the caller
explicitly requests publication. So `approvalAction` is set conditionally at the call site
(`input.requestPublish ? "readiness_scoring" : undefined`), rather than being statically
always-on like the Policy Artifact Agent's `policy_finalization`. A low-readiness learner
who requests publish is still denied approval-worthiness by the *recommendation* logic
itself (`flag_not_ready`, no escalation) — the governance guard only gates the publish-path,
draft-path recommendations are ungated by design.

## Result shape

```ts
interface AgentGovernanceResult {
  allowed: boolean;
  deniedReason?: string;
  requiresApproval: boolean;
  policyViolations: string[];
  escalationTarget?: string;
  auditPayload: Record<string, unknown>;
}
```

Every `evaluate()` call is appended to `AgentGovernanceGuard.listLog()` with an outcome of
`allowed` | `denied` | `approval_requested` | `policy_violation`, for admin-tower visibility.
