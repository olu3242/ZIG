# Trust OS Event Model (Batches 61-70 — Runtime Convergence)

STATUS: Design document. Documentation only. No event bus, queue, or message
infrastructure is introduced by this batch.

## 1. Is there a real event/message-bus in this codebase today?

**No.** A direct grep and read of `packages/agent-ingestion`, `packages/agent-runtime`,
`packages/agent-evidence-review`, and `packages/agent-trigger-automation` (the only
packages in the repo that define anything resembling a domain event) finds:

- `packages/agent-evidence-review/src/index.ts:26` defines its **own**, package-local
  `DomainEventType = "evidence.uploaded" | "evidence.review_requested" | "control.tested"`
  (3 values), with a comment explicitly stating this is "a business-trigger vocabulary
  specific to evidence review... the existing architecture (packages/agent-ingestion) has
  no domain-event concept yet."
- `packages/agent-trigger-automation/src/index.ts:67-77` defines a **second, different**
  `DomainEventType` union with 10 values: `evidence.uploaded`, `framework.selected`,
  `risk.created`, `risk.scored`, `gap.detected`, `assessment.completed`,
  `report.requested`, `module.completed`, `lab.completed`, `agent.failed`.
- These two `DomainEventType` unions are **not the same type** — they are independently
  declared, in different packages, with only one value in common (`evidence.uploaded`).
  Nothing imports one from the other, and nothing reconciles them. There is no shared
  `@zig/domain-events` package, no enum registry, and no runtime dispatcher that routes
  one canonical event type to multiple consumers.
- `packages/agent-ingestion` defines `AgentEventEnvelope`/`AgentEventSource`/
  `AgentEventType` (a third, narrower vocabulary, consumed by `packages/agent-runtime`)
  — this is the closest thing to infrastructure, but it is scoped to routing inbound
  triggers to the agent runtime (`getAgentsByEventType`), not a general-purpose
  publish/subscribe domain-event bus that other subsystems (Evidence OS, Questionnaire
  OS, Trust Center) could plug into.

**This is stated plainly per the task brief's instruction: there is no real event/message-
bus infrastructure in this codebase. Every event below is classified Build (Implement),
not invented as if infrastructure already existed to carry it.**

## 2. Contradiction found and resolved

The existence of two independently-declared `DomainEventType` unions
(`agent-evidence-review`'s 3-value version and `agent-trigger-automation`'s 10-value
version) is a real naming collision discovered during this batch's grounding pass — it
was not flagged by any of the six prior PRs, each of which only read the evidence-review
or trigger-automation package in isolation, not both together.

**Resolution:** Trust OS's eventual event vocabulary (table below) must not adopt either
existing union as-is. It is a **superset, newly named** `TrustDomainEventType`, scoped to
the cross-OS events Trust OS subsystems need to communicate, and is explicitly **not**
a replacement for either existing package-local union — `agent-evidence-review` and
`agent-trigger-automation` may keep their own narrower, already-shipped vocabularies for
their existing internal routing purposes. Any future implementation phase that wires a
real event bus should use this batch's `TrustDomainEventType` as the cross-subsystem
contract and let the two existing unions remain internal implementation detail of their
respective packages, rather than trying to force-unify three independently evolved
vocabularies into one before any of them has a real bus to enforce it.

## 3. Trust OS domain events — producers and consumers

All events below are **Implement** (Build) — no persisted event log, no bus, no
subscriber registry exists for any of them today.

| Event | Producer | Consumers | Notes |
|---|---|---|---|
| `EvidenceUploaded` | Evidence OS (Questionnaire/Evidence upload flow) | `agent-evidence-review` (real, today, via its own narrower `evidence.uploaded` event — the one value shared with this batch's vocabulary), Evidence Health reconciliation, Trust Score (Evidence component) | The one event with a real, working consumer already (`agent-evidence-review`'s `routeDomainEvent`) — everything else in this table is purely documented |
| `EvidenceReviewed` / `EvidenceApproved` / `EvidenceRejected` | Evidence OS (Trust Review workflow) | Evidence Health reconciliation, Confidence Score (Questionnaire OS), Trust Score | `evidence_reviews.status` column exists but nothing writes to it from a service today (PR #9 audit) |
| `ControlMapped` | Questionnaire OS (question -> control mapping) or Evidence OS (control_evidence join) | Confidence Score, Trust Knowledge Graph | No event emitted today; `control_mappings`/`control_evidence` are written directly, not through an event |
| `QuestionnaireSubmitted` | Questionnaire OS | Confidence Score computation, Trust Review workflow, Trust Center's Customer Assurance Portal (if externally triggered) | No `questionnaires` table exists yet; event is purely prospective |
| `ConfidenceScoreCalculated` | Questionnaire OS | Trust Analytics, Executive Intelligence | Must not write into `governance_scores` — distinct table per PR #8's explicit non-collision note |
| `AISystemRegistered` | AI Governance OS (AI Registry Lifecycle) | AI Risk Engine, AI Trust Score, Trust Knowledge Graph (AI branch) | No `ai_systems` table exists yet |
| `AIRiskAssessed` | AI Governance OS | AI Trust Score, Trust Score (AI Governance weight) | — |
| `TrustScoreRecalculated` | Trust OS core (composite score recompute) | Trust Analytics, Trust Certification Engine, Executive Intelligence, Trust Center Security Overview | Closest real analog: `GovernanceScoreEngine.calculateScore()` runs synchronously today, not event-driven — there is no recalculation trigger/event, it is called directly wherever a score is needed |
| `AccessRequestApproved` / `AccessRequestDenied` | Trust Center OS (Customer Assurance Portal) | Evidence Center (grants time-limited exposure), audit trail | No `AccessRequestService` or table exists yet |
| `TrustCertificationIssued` / `TrustCertificationRevoked` | Trust Intelligence OS (Trust Certification Engine) | Executive Intelligence, Trust Center Compliance Center (badge wall) | No certification table exists yet |
| `ContinuousAssuranceFindingRaised` | Trust Intelligence OS (Continuous Assurance) | Trust Recommendation Engine, Trust Certification Engine (can block progression per Batch 58's de-certification trigger) | No Continuous Assurance engine exists yet |
| `AgentRunCompleted` / `AgentRunFailed` | Zig's own agent runtime (pre-existing, real) | `agent-trigger-automation`'s `agent.failed` case (real, today — the one documented exception that calls `GovernanceSupervisorAgent.supervise()` directly rather than through `AgentRuntime.submit()`) | This is Zig's own agent infrastructure (see `TRUST_OS_AGENT_ARCHITECTURE.md`), included here only because Continuous Assurance and Trust Recommendation Engine would plausibly consume agent-run outcomes as one input signal, not because it is itself a customer-facing Trust OS event |

## 4. What this means for implementation sequencing (documentation guidance only)

If a future implementation phase builds a real event bus, the lowest-risk sequence
implied by the audit above is: (1) formalize `EvidenceUploaded` first, since
`agent-evidence-review` already half-implements a consumer for it; (2) add
`EvidenceReviewed`/`Approved`/`Rejected` next, since the `evidence_reviews` table already
exists with the right shape and only needs a writer; (3) only then add the genuinely
new Questionnaire OS, AI Governance OS, and Trust Intelligence OS events, which have zero
existing infrastructure to anchor to. This sequencing is advisory, consistent with
CLAUDE.md's "documentation before implementation" rule — no code is implied to exist by
stating this order.
