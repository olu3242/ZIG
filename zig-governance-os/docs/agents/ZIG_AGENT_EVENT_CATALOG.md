# ZIG Agent Event Catalog — Phase 2B/2D/Batch 3/Batch 5

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

## 3. Batch 3 — Domain Intelligence Agents

Each agent in `packages/agent-domain-intelligence` reuses the `domainEventType` payload
pattern, but each agent's own trigger union is scoped to its own module (`framework-mapping`,
`risk-assessment`, `control-advisor`, `policy-artifact`), per the "scoped to its own package"
rule above. `AgentEventType` remains unchanged.

### Framework Mapping Agent (`compliance`)

Domain triggers: `framework.selected`, `risk.created`, `control.created`, `evidence.uploaded`,
`report.requested` (modeled as `FrameworkMappingSubjectType`: `control`/`evidence`/`risk`/
`report`/`framework_selection`).

| Action | Meaning | Requires approval |
|---|---|---|
| `map_control_to_framework` | Control crosswalked to a framework requirement | No |
| `map_evidence_to_framework` | Evidence crosswalked to a framework requirement | No |
| `map_risk_to_framework` | Risk crosswalked to a framework requirement | No |
| `map_framework_requirement` | General framework-selection/report mapping | No |
| `map_unsupported_framework` | Requested framework code is not in `@zig/frameworks`'s registry (e.g. NIST AI RMF today) | No — explicit gap, not a fabricated mapping |

### Risk Assessment Agent (`risk`)

Domain triggers: `risk.created`, `assessment.started`, `evidence.rejected`, `control.failed`.

| Action | Meaning |
|---|---|
| `recommend_treatment_mitigate` | Critical/high/medium residual risk band |
| `recommend_treatment_transfer` | Reserved for future treatment-strategy expansion |
| `recommend_treatment_accept` | Low/informational residual risk band |
| `recommend_treatment_avoid` | Reserved for future treatment-strategy expansion |

### Control Advisor Agent (`control`)

Domain triggers: `risk.scored`, `framework.selected`, `control.requested`.

| Action | Meaning |
|---|---|
| `recommend_control_strengthening` | Implemented but below the effective threshold |
| `recommend_control_acceptance` | Effective or optimized |
| `flag_control_gap` | Not implemented or partially implemented |
| `flag_control_exception` | Has an open exception regardless of effectiveness |

### Policy Artifact Agent (`policy`)

Domain triggers: `artifact.requested`, `gap.detected`, `control.created`.

| Action | Meaning | Requires approval |
|---|---|---|
| `draft_policy_artifact` | Coverage supports drafting a new artifact | Yes — `policy_finalization` always required before publication |
| `flag_policy_coverage_gap` | Coverage too low to productively draft yet | No |

## 4. Batch 5 — Learning + Career Agents

Both agents live in `packages/agent-learning-career`, reusing the shared
`orchestrateDomainAgent()` helper from `packages/agent-domain-intelligence` rather than
duplicating it — the orchestration path itself is domain-agnostic, so it is imported, not
re-implemented.

### Learning Path Agent (`learning`)

Domain triggers: `user.onboarded`, `learning.started`, `lesson.completed`,
`assessment.failed`, `assessment.passed`, `module.completed`, `framework.selected`.

| Action | Meaning | Requires approval |
|---|---|---|
| `recommend_next_module` | No weaknesses detected; advance to the next module | No |
| `recommend_module_review` | A weak skill needs a review activity | No |
| `recommend_practice_lab` | A weak (or high-priority) skill needs hands-on lab practice | No |
| `recommend_scenario` | A weak skill needs a scenario exercise | No |
| `recommend_remediation` | A failed assessment needs remediation before retrying | No |
| `flag_no_signal` | No skill signals exist yet for this learner | No |

This agent never requires approval — every action is a draft recommendation, never a
finalization or publication, consistent with the existing `"learning"` agent definition
holding no `execute:*` permission.

### Career Portfolio Agent (`certification`)

Domain triggers: `module.completed`, `lab.completed`, `artifact.approved`,
`assessment.passed`, `readiness.updated`, `portfolio.requested`.

| Action | Meaning | Requires approval |
|---|---|---|
| `draft_portfolio_summary` | Readiness below threshold; draft a summary while it builds | No |
| `recommend_certification_readiness` | Readiness above threshold; recommend a readiness review | No |
| `flag_not_ready` | Publish was requested but readiness is below threshold | No |
| `request_portfolio_publish_approval` | Publish was requested and readiness supports it | Yes — `readiness_scoring`, set only when the caller requests publish/official-certification-readiness/export |

This agent reuses the existing `"certification"` agent id (no dedicated "career"/"portfolio"
agent exists) and the existing `"learning"` RBAC resource (no dedicated "career"/"portfolio"
resource exists in `RbacResource`) — both are documented reuse decisions, not new
registrations.

## 5. Batch 4 — Execution Layer Agents

All three agents live in `packages/agent-execution`, reusing the shared
`orchestrateDomainAgent()` helper from `packages/agent-domain-intelligence` by import, the
same pattern Batch 5 established.

### Readiness Scoring Agent (`assessment`)

Domain triggers: `assessment.completed`, `control.updated`, `evidence.approved`,
`framework.selected`, `report.requested`.

| Action | Meaning | Requires approval |
|---|---|---|
| `recommend_readiness_certification_ready` | Aggregate readiness at/above 75% | No |
| `draft_readiness_assessment` | Aggregate readiness below 75%; weak areas flagged | No |
| `flag_readiness_gaps` | Publish requested but readiness/weak areas block certification | No |
| `request_readiness_publication_approval` | Publish requested and readiness supports it | Yes — `readiness_scoring`, set only when `input.requestPublish` is true |

### Remediation Agent (`audit`)

Domain triggers: `gap.detected`, `control.failed`, `evidence.missing`, `risk.high`,
`assessment.completed`.

| Action | Meaning | Requires approval |
|---|---|---|
| `recommend_remediation_plan` | Risk band is medium/low; standard remediation plan | No |
| `request_high_risk_approval` | Risk band is critical/high | Yes — `high_risk_recommendation`, set when the precomputed risk band is critical or high |

Produces a structured remediation plan: priority, recommended owner, estimated effort
(days), suggested due date (days out), and dependencies (e.g. `evidence:missing`,
`control:exception`) — not a persisted task record, since no standalone task-management
package exists in the repo yet.

### Reporting Agent (`executive`)

Domain triggers: `report.requested`, `assessment.completed`, `readiness.updated`.

Also reserved for this surface (named in the mission's event list, not yet emitted by any
handler in this batch): `gap.detected`, `task.generated`, `report.generated`,
`report.approved`, `report.rejected`.

| Action | Meaning | Requires approval |
|---|---|---|
| `generate_report` | Non-official report; generated directly | No |
| `request_report_publication_approval` | Official/externally-publishable report | Yes — `report_generation`, set only when `input.isOfficial` is true |
