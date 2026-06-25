# Trust OS Agent Architecture (Batches 61-70 — Runtime Convergence)

STATUS: Design document. Documentation only. No code, route, or migration is introduced
by this batch.

## 1. The distinction this document holds the line on

Two entirely different things in this codebase both involve the word "AI agent," and PR
#12's audit (Finding 1, Batch 41) already drew the line once. This document restates it
explicitly for the runtime-convergence picture and never lets the two blur:

1. **Zig's own AI agent runtime** — the infrastructure Zig itself uses to run its
   recommendation/evidence-review/trigger-automation agents as part of operating Trust OS
   (and the rest of the platform). This is **in scope for this document.**
2. **AI Governance OS's subject matter** — the customer organization's own AI systems
   (ChatGPT, Claude, Copilot, custom LLMs, the customer's own internal agents) that the
   customer wants Zig to help them govern, inventory, risk-assess, and certify. This is
   **out of scope for this document** — it is AI Governance OS's domain (PR #12),
   documented in this batch's `TRUST_OS_RUNTIME_ARCHITECTURE.md` and
   `TRUST_OS_COMPONENT_MAP.md` only as a cross-reference, not redefined here.

**These must never be conflated.** A customer's AI inventory record (e.g. "Customer uses
GPT-4 for support-ticket triage, owned by their Support department") and one of Zig's own
governed agents (e.g. `agent-evidence-review`, owned by Zig, running inside Zig's own
runtime to help operate Trust OS) are different subjects, different tables (none exist yet
for the former; `governed_agents` and its satellite tables already exist for the latter),
and different audiences (the customer's own AI estate vs. Zig's operational
infrastructure).

## 2. Zig's own agent architecture — what is real today

Read directly from source in this session:

| Package | Role | Real? |
|---|---|---|
| `packages/agent-ingestion` | Defines `AgentEventEnvelope`/`AgentEventSource`/`AgentEventType` — the inbound trigger vocabulary that resolves to an agent via the runtime | Real |
| `packages/agents` | `getAgentById`, `getAgentsByCapability`, `getAgentsByEventType` — the agent registry/resolver | Real |
| `packages/runtime-queue` | `RuntimeQueueJob` — job queueing for agent execution | Real |
| `packages/runtime-persistence` | `RuntimeRecord` — in-process record shape mirroring the `agent_runs`/`agent_decisions`/`agent_tasks`/`agent_approvals` tables (`supabase/migrations/202606180006_production_convergence.sql`) | Real |
| `packages/agent-runtime` | `AgentRunRequest`/`AgentRunRecord`/`AgentHandler` — the canonical execution flow: Event (agent-ingestion) -> Agent Registry (agents) -> Runtime Queue (runtime-queue) -> Worker (execute()) -> Runtime Persistence -> Audit Records. Explicitly documented in its own header comment as built "only on existing pieces," no parallel runtime | Real |
| `packages/governance-engine/src/rbac/RbacEngine.ts` | `can()`/`canView`/`canCreate`/`canEdit`/`canDelete`/`canApprove` over `AccessSubject`, `RbacResource`, `RbacAction` — the base permission engine, used by both human users and agents | Real |
| `packages/agent-governance` | `AgentGovernanceGuard` — wraps `RbacEngine.can()` (does not replace it) and adds the agent-specific layer RbacEngine has no concept of: agent permission scope, tool access, an explicit `ApprovalRequiredAction` set (`evidence_rejection`, `readiness_scoring`, `report_generation`, `policy_finalization`, `admin_action`, `high_risk_recommendation`), and policy violation logging | Real |
| `packages/agent-evidence-review` | A full agent vertical slice: routes its own 3-value `DomainEventType` through `recommend()` to produce an `EvidenceReviewRecommendation`, runs through `AgentRuntime`/`AgentGovernanceGuard`. Explicitly documented as "recommend only — it never finalizes" | Real, and the most complete example of the pattern |
| `packages/agent-trigger-automation` | Defines its own, separate 10-value `DomainEventType`, with one documented exception: `agent.failed` bypasses `AgentRuntime.submit()` and calls `GovernanceSupervisorAgent.supervise()` directly, since the Governance Supervisor Agent is a meta-agent inspecting already-collected run records rather than a registry-resolved agent | Real |
| `packages/supervisor-agents` | `GovernanceSupervisorAgent` — the one meta-agent that inspects `AgentRunRecord`/`GovernanceDecisionLogEntry`/`RuntimeRecord` slices rather than being registry-resolved/routed like every other agent | Real |
| `packages/ai-governance` | `AiGovernanceLayer.canExecute(policy)` — a 14-line boolean gate over an `AiGovernancePolicy` (`agentPermissions`, `approvalRequired`, `piiProtection`, `auditLogging`, `promptGovernance`, `modelGovernance`). No persistence, no caller found anywhere in `packages/*/src/` in this session's grep. **This is the package whose name most invites confusion with AI Governance OS — and it is entirely about Zig's own agents, never the customer's AI** | Real code, but a thin, currently-uncalled stub |
| `governed_agents` table + satellite family (`agent_raci_assignments`, `agent_handoffs`, `agent_memory_policies`, `agent_approval_workflows`, `agent_certifications`, `agent_risk_register`, `agent_self_healing_events`, `agent_scorecards`, `agent_audit_traces`, `agent_finops_metrics`, `agent_soc_events`) | The persisted record of Zig's own governed agent fleet — `agent_key`, `agent_type`, `owner`, `supervisor`, `tools`, `certification_level` columns confirm this is Zig-internal-agent shaped, with no `provider`/`vendor`/`is_customer_owned` discriminator | Real |

## 3. How Zig's own agents participate in running Trust OS itself

This is the answer the task asks for — not "what AI does the customer have," but "how do
Zig's own agents help operate Trust OS":

- `agent-evidence-review` is the clearest working example: when an `EvidenceUploaded`-class
  trigger fires (today, its own package-local `evidence.uploaded` event — see
  `TRUST_OS_EVENT_MODEL.md` for the broader event vocabulary this batch proposes), it
  produces an `EvidenceReviewRecommendation` with an action, confidence, rationale, and
  next steps, then routes through `AgentGovernanceGuard` (which itself delegates every
  permission check to the same `RbacEngine` a human tenant user's request would go
  through) before being recorded. It never finalizes the review itself — a human stays in
  the approval loop, consistent with `AgentGovernanceGuard`'s `ApprovalRequiredAction` set
  explicitly including `evidence_rejection`.
- `agent-trigger-automation` is the dispatcher: it listens for its own 10-value
  `DomainEventType` (which, per `TRUST_OS_EVENT_MODEL.md`'s Contradiction 1, is a
  different vocabulary than `agent-evidence-review`'s) and routes to the appropriate
  agent, with the one documented exception of `agent.failed` going straight to
  `GovernanceSupervisorAgent`.
- `GovernanceSupervisorAgent` (`packages/supervisor-agents`) is Trust OS's own internal
  oversight mechanism for its own agents — it inspects run records and decision logs
  *of Zig's other agents*, which is structurally the same idea as AI Governance OS's
  customer-facing oversight, but applied reflexively to Zig's own fleet rather than to a
  customer's AI estate. This reflexive relationship (Zig governs its own agents using
  patterns that look like what AI Governance OS will offer customers for theirs) is worth
  naming explicitly: **it is not the same code, and should not become the same code** —
  `GovernanceSupervisorAgent` is wired into `AgentRuntime`/`agent_runs` tables and has no
  reason to be generalized into a customer-facing product feature; if AI Governance OS's
  eventual AI Risk Engine wants a similar "supervisor" concept for customer AI systems, it
  should be a new, separately-built component, not an extension of
  `GovernanceSupervisorAgent`.
- Every future Trust OS subsystem that wants an AI-assisted action (e.g. a future
  "Questionnaire Drafting Agent" suggested by PR #8's `AI_DRAFTING_GUIDELINES.md`, or a
  future "Trust Recommendation Agent" for PR #11's Recommendation Engine) should be built
  as a new vertical slice following `agent-evidence-review`'s exact pattern: own
  `DomainEventType` (or, going forward, the new cross-subsystem `TrustDomainEventType`
  this batch proposes in `TRUST_OS_EVENT_MODEL.md`), a `recommend()`-only function (never
  finalizes), routed through the existing `AgentRuntime`/`AgentGovernanceGuard`. None of
  this requires a new runtime, a new governance guard, or a new RBAC engine — the
  infrastructure already supports it.

## 4. Explicit in-scope / out-of-scope statement

**In scope for this document (Zig's own agent architecture):** `agent-runtime`,
`agent-ingestion`, `agents` (registry), `runtime-queue`, `runtime-persistence`,
`agent-governance`, `agent-evidence-review`, `agent-trigger-automation`,
`supervisor-agents`, `packages/ai-governance` (as a Zig-internal execution gate, not as
AI Governance OS's subject), `governed_agents` and its full satellite table family.

**Out of scope for this document (the customer's AI assets — AI Governance OS's domain,
PR #12, referenced but not redefined):** any future `ai_systems`/`ai_models`/
`ai_providers` table, AI Registry Lifecycle, AI Risk Engine (8 domains), AI Governance
Controls Library, AI Trust Score, AI Decision Registry, AI Evidence Mapping. None of these
govern Zig's own agents; all of them govern AI the *customer* owns or uses. The single
package name most likely to cause confusion between the two scopes —
`packages/ai-governance` — is explicitly resolved here as belonging to the in-scope list
(Zig's own agent execution gate), exactly as PR #12's original audit found, carried
forward unchanged by this batch.
