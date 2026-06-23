# ZIG Agent Trigger Map — Trigger Automation Layer

`packages/agent-trigger-automation` (`@zig/agent-trigger-automation`) is a **dispatcher
layer**, not a new agent layer. It defines one canonical `DomainEventType` union (10
members) and one entry point, `emitDomainEvent()`, that routes each event to the existing
agent function(s) that already implement Registry -> Governance -> Runtime -> Decision ->
Audit via `orchestrateDomainAgent()` (or `reviewEvidence()`'s equivalent, hand-built in Phase
2D before the shared helper existed). No agent logic, RBAC rule, runtime queue, or audit path
is reimplemented here.

## Canonical `DomainEventType` (10)

```ts
export type DomainEventType =
  | "evidence.uploaded"
  | "framework.selected"
  | "risk.created"
  | "risk.scored"
  | "gap.detected"
  | "assessment.completed"
  | "report.requested"
  | "module.completed"
  | "lab.completed"
  | "agent.failed";
```

This is a separate, smaller vocabulary than the per-agent `triggeringEvent`/`domainEventType`
unions already documented in `ZIG_AGENT_EVENT_CATALOG.md` (e.g. risk-assessment's
`"risk.created" | "assessment.started" | "evidence.rejected" | "control.failed"`). The
dispatcher's 10 events are the **outward-facing** trigger surface a caller (UI, webhook,
test harness) fires; internally, `emitDomainEvent()` translates each one into the specific
`triggeringEvent`/`domainEventType` value the target agent function expects.

## Routing table

| Domain event | Routes to | Target's own trigger value | Fan-out |
|---|---|---|---|
| `evidence.uploaded` | `reviewEvidence()` (`@zig/agent-evidence-review`) | `domainEventType: "evidence.uploaded"` | No |
| `framework.selected` | `runFrameworkMappingAgent()` (`@zig/agent-domain-intelligence`) | `domainEventType: "framework.selected"` | No |
| `risk.created` | `runRiskAssessmentAgent()` (`@zig/agent-domain-intelligence`) | `triggeringEvent: "risk.created"` | No |
| `risk.scored` | `runControlAdvisorAgent()` (`@zig/agent-domain-intelligence`) | `triggeringEvent: "risk.scored"` | No |
| `gap.detected` | `runPolicyArtifactAgent()` **and** `runRemediationAgent()` (both run; both outcomes returned) | `triggeringEvent: "gap.detected"` (both) | **Yes** |
| `assessment.completed` | `runReadinessScoringAgent()` (`@zig/agent-execution`) | `triggeringEvent: "assessment.completed"` | No |
| `report.requested` | `runReportingAgent()` (`@zig/agent-execution`) | `triggeringEvent: "report.requested"` | No |
| `module.completed` | `runLearningPathAgent()` **and** `runCareerPortfolioAgent()` (both run; both outcomes returned) | `triggeringEvent: "module.completed"` (both) | **Yes** |
| `lab.completed` | `runCareerPortfolioAgent()` (`@zig/agent-learning-career`) | `triggeringEvent: "lab.completed"` | No |
| `agent.failed` | `GovernanceSupervisorAgent.supervise()` (`@zig/supervisor-agents`) — **direct call, no runtime.submit()** | n/a (meta-agent, not registry-resolved) | No |

## Payload contract

`emitDomainEvent()` accepts:

```ts
interface EmitDomainEventInput {
  domainEventType: DomainEventType;
  runtime: AgentRuntime;
  guard: AgentGovernanceGuard;
  subject: AccessSubject;
  context: AgentRunRequest["context"]; // AgentContext: { tenantId; userId; organizationId?; persona? }
  eventId: string;
  payload?: Record<string, unknown>;  // optional overrides; missing fields get fixture defaults
}
```

Any field the target agent's input requires but the caller's `payload` omits is filled with a
deterministic fixture default from `src/fixtures.ts` (`randomId(prefix)` + safe defaults —
**no hardcoded production IDs**). Callers can override any field by including it in `payload`
(e.g. `payload: { risk: { likelihood: 9, impact: 9, ... } }` to force a high-risk band).

The return value is a `DomainEventEnvelope<T>`:

```ts
interface DomainEventEnvelope<T> {
  domainEventType: DomainEventType;
  eventId: string;
  correlationId: string;   // crypto.randomUUID(), generated fresh per dispatch
  tenantId: string;
  organizationId?: string;
  userId: string;
  source: "trigger_automation";
  sourceId: string;
  timestamp: string;       // ISO 8601
  result: T;                // the called agent function's own outcome shape, untouched
}
```

`emitDomainEvent()` is generically overloaded on the literal `DomainEventType` passed in, so
callers (including the package's own tests) get the precisely narrowed `result` type for the
event they fired, not the full result union.

## Fan-out special cases

**`gap.detected`** fires both `runPolicyArtifactAgent()` and `runRemediationAgent()`
independently — two separate `AgentRuntime.submit()`/`execute()` calls, two separate run ids,
two separate governance evaluations. The envelope's `result` is
`{ policyArtifact: DomainAgentOutcome<...>, remediation: DomainAgentOutcome<...> }`. If the
risk fixture/payload scores critical/high, `runRemediationAgent()`'s own internal logic (see
`packages/agent-execution/src/remediation.ts`) sets `approvalAction: "high_risk_recommendation"`
and the governance result carries `requiresApproval: true` — this dispatcher does not compute
that itself, it only calls the function that already does.

**`module.completed`** fires both `runLearningPathAgent()` and `runCareerPortfolioAgent()`
independently with a shared `learnerId`. The envelope's `result` is
`{ learningPath: DomainAgentOutcome<...>, careerPortfolio: DomainAgentOutcome<...> }`. If the
caller's payload sets `requestPublish: true` with a high readiness score, the career
portfolio branch routes to `request_portfolio_publish_approval` with
`governance.requiresApproval === true`, again computed entirely inside the existing
`runCareerPortfolioAgent()`.

## `agent.failed` — the documented exception

`GovernanceSupervisorAgent` (`packages/supervisor-agents/src/index.ts`) is a meta-agent: it
inspects already-collected `AgentRunRecord[]` / `GovernanceDecisionLogEntry[]` /
`RuntimeRecord[]` slices for governance/safety violations. It is **not** registry-resolved
(no `AgentId` is assigned to it) and is **not** routed through `AgentRuntime.submit()` — there
is no new run to submit, only existing records to inspect. For `agent.failed`,
`emitDomainEvent()` calls `supervisor.supervise({ runs, governanceLog, auditTrail,
registeredAgentIds })` directly, using whatever records the caller supplies in `payload`
(typically a synthetic `fixtureFailedRunRecord()` for test/demo purposes, or a real slice of
collected records in a future production integration). This is the **only** branch that does
not flow through `AgentRuntime`/`AgentGovernanceGuard` — every other `DomainEventType` does.

## Validation

- `npx tsc -p packages/agent-trigger-automation/tsconfig.json --noEmit` — clean.
- `npm run test --workspace @zig/agent-trigger-automation` — 12 test files, one per trigger
  plus the two documented fan-out cases, all `[PASS]`.
