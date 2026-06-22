# ZIG Agent Workflow Map — Phase 2D / Batch 3 / Batch 5

## End-to-end flow

```
evidence.uploaded (domain event, payload metadata)
  -> event ingestion (AgentIngestion.ingest(), inside AgentRuntime.submit())
  -> registry resolution (getAgentById("evidence"))
  -> governance check (AgentGovernanceGuard.evaluate())
  -> runtime execution (AgentRuntime.execute())
  -> existing evidence engine (EvidenceManagementEngine.health())
  -> decision persistence (AgentRunRecord.decision, audit trail)
  -> approval if required (re-evaluate guard with approvalAction: "evidence_rejection")
  -> audit trail (AgentGovernanceGuard.listLog() + AgentRuntime.listAuditTrail())
  -> admin visibility (existing agent-control-tower / agent-soc admin screens, via
     @zig/agent-registry's AgentRegistry.inventory(), unchanged from Phase 2A)
```

Implemented in `reviewEvidence()`, `packages/agent-evidence-review/src/index.ts`.

## Agent definition

The Evidence Review Agent reuses the existing `"evidence"` entry in
`packages/agents/src/index.ts`'s `agentRegistry` — no 13th agent was registered. Its
`AgentDefinition` (canonical, via `getAgentById("evidence")`):

- `id`: `"evidence"`
- `capabilities`: `["evidence_collection", "evidence_classification"]`
- `toolAccess`: `[{ tool: "evidence-engine", scope: "read" }]`
- `permissions`: `["read:evidence", "recommend:evidence"]`
- `eventTypes`: advisory set (`agent_started`/`completed`/`failed`/`escalated`) — it holds no
  `execute:*` permission, consistent with "the agent recommends, it never finalizes."

## Handler responsibilities

`recommend()` in `packages/agent-evidence-review/src/index.ts`:

1. Loads evidence context (`EvidenceReviewInput`: existence, expiry, review status, weak flag).
2. Invokes the existing evidence engine (`EvidenceManagementEngine.health()`, unmodified).
3. Maps health (+ `weak`/`rejected` signal) to one of five `recommend_*`/`request_*` actions.
4. Returns confidence, rationale, evidence/control/framework references, and next steps —
   every output carries the explainability fields the AI Command Center pattern requires
   (reason, data used, confidence, framework reference).

## Admin visibility

Reused, not rebuilt: `AgentRuntime.listAuditTrail()` and `AgentGovernanceGuard.listLog()`
produce the same shapes `RuntimePersistence`/admin screens already expect
(`RuntimeRecord`, decision log entries). No new admin route was created in Phase 2D; wiring
these into `apps/admin/app/admin/agent-control-tower` and `/admin/agent-soc` is a Phase 3+
follow-up once more agents are flowing through the same runtime.

## Validation

- `npx tsx packages/agent-evidence-review/src/tests/evidence-review.test.ts` — 10 assertions,
  `[PASS]`.

## Batch 3 — Domain Intelligence Agents

Four agents, one shared orchestration path. All four reuse `orchestrateDomainAgent()` in
`packages/agent-domain-intelligence/src/shared.ts`, which replicates the exact Phase 2D
flow above (Event → Registry → Governance Guard → Runtime → Domain Engine → Decision →
Audit) generically, parameterized by agent id, RBAC resource/action, optional approval
action, and a pure `produce()`/`toDecision()` pair supplied by each agent module.

```
domain event (payload.domainEventType, e.g. "control.created", "risk.created")
  -> orchestrateDomainAgent() (packages/agent-domain-intelligence/src/shared.ts)
  -> registry resolution (getAgentById(agentId)) — reuses an existing agentRegistry entry,
     no 13th/14th/... agent is registered
  -> governance check (AgentGovernanceGuard.evaluate(), with approvalAction when applicable)
  -> runtime execution (AgentRuntime.execute())
  -> existing domain engine (unmodified):
       FrameworkIntelligenceEngine.score()   (@zig/frameworks)
       RiskManagementEngine.score()          (@zig/risks)
       ControlManagementEngine.assess()      (@zig/controls)
       PolicyManagementEngine.coverage()     (@zig/policies)
  -> decision persistence (AgentRunRecord.decision, audit trail)
  -> audit trail (AgentGovernanceGuard.listLog() + AgentRuntime.listAuditTrail())
  -> admin visibility (same existing shapes as Phase 2D — no new UI route added)
```

### Agent definitions (all reused, none new)

| Agent | Reused `agentId` | RBAC resource | Domain engine called |
|---|---|---|---|
| Framework Mapping Agent | `"compliance"` | `frameworks` | `@zig/frameworks` `FrameworkIntelligenceEngine` |
| Risk Assessment Agent | `"risk"` | `risks` | `@zig/risks` `RiskManagementEngine` |
| Control Advisor Agent | `"control"` | `controls` | `@zig/controls` `ControlManagementEngine` |
| Policy Artifact Agent | `"policy"` | `reports` (closest existing approval-bearing resource — `RbacEngine` has no `policies` resource) | `@zig/policies` `PolicyManagementEngine` |

### Handler responsibilities

Each agent module (`packages/agent-domain-intelligence/src/{framework-mapping,
risk-assessment,control-advisor,policy-artifact}.ts`) exports a pure `recommend*()` function
that:

1. Calls the existing, unmodified domain engine with the input as-is.
2. Maps the engine's raw output (readiness/band/score/coverage) to a named recommendation
   action — never re-deriving the score itself.
3. Returns rationale, confidence, and references alongside the action, satisfying the
   explainability requirement.

Two deliberate, documented gap-handling decisions:

- **Framework Mapping Agent**: an unregistered framework code (e.g. `nist_ai_rmf`, which is
  not yet in `@zig/frameworks`'s `frameworkRegistry`) returns `map_unsupported_framework`
  rather than a fabricated mapping — an explicit gap, not invented data.
- **Policy Artifact Agent**: every `draft_policy_artifact` recommendation sets
  `approvalAction: "policy_finalization"` (already defined in Phase 2C's
  `APPROVAL_REQUIRED_ACTIONS`), so human approval before publication falls out of the
  existing governance guard with no new governance code.

### Admin visibility

Same as Phase 2D — reused, not rebuilt. No new admin UI route was added in Batch 3; wiring
`listAuditTrail()`/`listLog()` for these four agents into a live admin screen remains
deferred to a later batch, per the explicit "extend later" instruction.

### Validation

- `npx tsc -p packages/agent-domain-intelligence/tsconfig.json --noEmit` — clean.
- `npm run test --workspace @zig/agent-domain-intelligence` — runs all four suites
  (framework-mapping, risk-assessment, control-advisor, policy-artifact), each with 7-8
  assertions (happy path, failure path, tenant isolation, RBAC denial, audit logging,
  explainability, replay, plus an approval-required check for Policy Artifact) — all
  `[PASS]`.

## Batch 5 — Learning + Career Agents

Two agents, same shared orchestration path — reused by import, not reimplemented. Both
agent modules in `packages/agent-learning-career/src/` import `orchestrateDomainAgent()`
directly from `@zig/agent-domain-intelligence` rather than defining a second copy of the
helper, since the helper is already domain-agnostic.

```
domain event (e.g. "assessment.failed", "portfolio.requested")
  -> orchestrateDomainAgent() (imported from @zig/agent-domain-intelligence)
  -> registry resolution (getAgentById("learning") / getAgentById("certification")) —
     both reuse existing agentRegistry entries, no new agent id registered
  -> governance check (AgentGovernanceGuard.evaluate(), approvalAction set conditionally
     by the Career Portfolio Agent based on input.requestPublish)
  -> runtime execution (AgentRuntime.execute())
  -> existing domain engines (unmodified):
       AdaptiveLearningEngine.recommend()/detectWeaknesses()  (@zig/adaptive-learning)
       AssessmentEngine.grade()                                (@zig/assessment-engine)
       LearningPathGenerator.outputs()                         (@zig/learning-paths)
       CareerOS.readiness()/resumeHeadline()                   (@zig/career-os)
       CredentialingPlatform.credentialTypes()                 (@zig/credentials)
  -> decision persistence (AgentRunRecord.decision, audit trail)
  -> audit trail (AgentGovernanceGuard.listLog() + AgentRuntime.listAuditTrail())
  -> admin visibility (same existing shapes — no new UI route added)
```

### Agent definitions (both reused, neither new)

| Agent | Reused `agentId` | RBAC resource | Domain engines called |
|---|---|---|---|
| Learning Path Agent | `"learning"` | `learning` | `@zig/adaptive-learning`, `@zig/assessment-engine`, `@zig/learning-paths` |
| Career Portfolio Agent | `"certification"` (no dedicated "career" agent exists) | `learning` (no dedicated "career"/"portfolio" resource exists) | `@zig/career-os`, `@zig/credentials` |

### Handler responsibilities

- **Learning Path Agent** (`learning-path.ts`): on `assessment.failed`, calls
  `AssessmentEngine.grade()` to confirm the failure and surface `remediationSkillIds`
  before recommending remediation. Otherwise calls `AdaptiveLearningEngine.recommend()`
  against the learner's skill signals and maps its `action`/`priority` output to a named
  agent action. With no weaknesses detected, advances to the next module, optionally citing
  the learner's selected framework via `frameworkReference`.
- **Career Portfolio Agent** (`career-portfolio.ts`): always calls `CareerOS.readiness()`
  to score the learner's portfolio/certification/interview/practical signals and
  `CareerOS.resumeHeadline()` to draft a headline. When `requestPublish` is set on the
  input (the caller is asking to publish externally, mark certification readiness
  official, or export proof-of-work), readiness below 75 is flagged `flag_not_ready`
  (no approval — nothing to approve), while readiness at or above 75 produces
  `request_portfolio_publish_approval` and sets `approvalAction: "readiness_scoring"` so
  the governance guard requires human approval before anything is actually published.

### Admin / user experience

No new AI-only screens were added, per the mission's "do not create disconnected AI
screens" rule. The agents' outputs (`recommendedSkillId`, `frameworkReference`,
`nextSteps`, `resumeHeadline`, `readinessScore`) are shaped to slot directly into the
existing learning dashboard, module pages, assessment review, and career portfolio/readiness
pages once those screens are wired to read from `AgentRuntime`'s decision/audit records —
that wiring itself remains deferred, consistent with every prior batch's "no new admin UI
route" deferral.

### Validation

- `npm run typecheck --workspace @zig/agent-learning-career` (`tsc --noEmit`) — clean.
- `npm run test --workspace @zig/agent-learning-career` — both suites `[PASS]`
  (`learning-path`: 9 assertions; `career-portfolio`: 10 assertions).
