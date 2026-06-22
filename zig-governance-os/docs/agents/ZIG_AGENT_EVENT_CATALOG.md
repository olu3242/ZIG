# ZIG Agent Event Catalog — Phase 2B/2D

Two distinct, deliberately separate vocabularies:

## 1. `AgentEventType` — generic runtime lifecycle (unchanged)

Defined in `packages/agent-ingestion/src/index.ts`. Describes what stage of *execution* a
run is in, independent of business domain:

| Event | Meaning |
|---|---|
| `agent_started` | Run began executing |
| `agent_completed` | Run finished successfully |
| `agent_failed` | Run threw / errored |
| `agent_escalated` | Run escalated to a human |
| `agent_approved` | An execute-capable run was approved |
| `agent_rejected` | An execute-capable run was rejected |
| `agent_suspended` | An execute-capable run was suspended |
| `agent_recovered` | A suspended run resumed |

`AgentRuntime`/`AgentGovernanceGuard`/`EvidenceReviewAgent` all consume this type exactly as
defined in Phase 2A — it was not extended or rebuilt for Phase 2D.

## 2. `DomainEventType` — business triggers (new, additive, scoped to evidence review)

Defined in `packages/agent-evidence-review/src/index.ts` as `DomainEventType`. Describes
*why* a review run was triggered, in business terms. Carried as `payload.domainEventType` on
the `AgentRunRequest` sent into `AgentRuntime.submit()` — **not** added to `agent-ingestion`'s
enum, because the existing Event Fabric has no domain-event concept to extend; inventing one
there would be rebuilding it, not connecting to it.

| Domain event | Trigger |
|---|---|
| `evidence.uploaded` | New evidence artifact uploaded for a control/framework requirement |
| `evidence.review_requested` | A reviewer explicitly requests re-review of existing evidence |
| `control.tested` | A control test ran and evidence currency/health needs re-evaluation |

All three domain events route through the same evidence-health recommendation logic
(`recommend()` in `packages/agent-evidence-review/src/index.ts`) — the domain event explains
the trigger, not a different decision path. Future agents (Phase 3+) will define their own
`DomainEventType` unions the same way, scoped to their own package, rather than growing a
single shared enum that couples unrelated domains.

## Recommendation actions (Evidence Review Agent)

| Action | Meaning | Requires approval |
|---|---|---|
| `recommend_evidence_acceptance` | Evidence is current/approved | No |
| `recommend_evidence_refresh` | Evidence expired | No |
| `recommend_evidence_missing` | No evidence artifact exists | No |
| `recommend_evidence_rework` | Evidence present but weak / still pending review | No |
| `request_evidence_rejection_approval` | Evidence already rejected; finalizing requires a human approval decision | Yes |

None of these mutate evidence state directly — `EvidenceManagementEngine` (existing,
unmodified) only computes health from inputs; it has no mutating approve/reject method for
the agent to bypass. The agent's output is a recommendation; governance + an approval
workflow own the final state transition.
