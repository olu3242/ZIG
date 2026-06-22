# ZIG Agent Permission Matrix — Phase 2C

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

Phase 2D wires only `evidence_rejection` end-to-end (Evidence Review Agent). The remaining
rows are reserved for the agents that adopt this guard in later batches.

## Policy violations enforced today

- `delete` actions without an `approvalAction` are always flagged — a destructive action must
  declare which approval rule governs it.
- `evidence_rejection` approval requests must target the `evidence` resource.

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
