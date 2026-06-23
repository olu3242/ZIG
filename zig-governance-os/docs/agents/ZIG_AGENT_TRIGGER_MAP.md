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

## Production wiring status (this batch — `feature/zig-agent-os-live-wiring`)

| Domain event | Status | Real call site |
|---|---|---|
| `framework.selected` | **PRODUCTION-WIRED** | `emitFrameworksSelectedEvent()` in `apps/web/app/onboarding/actions.ts`, called from `frameworksSetupAction()` (the real onboarding step where a user picks their frameworks of interest) via `dispatchDomainEvent()` (`apps/web/app/lib/agent-os.ts`) |
| `evidence.uploaded` | Test-only | `apps/web/app/evidence/page.tsx` is read-only display over static MVP template data (`evidenceTemplates` from `@/app/lib/mvp-data`); there is no upload form, server action, or API route that creates/mutates evidence in `apps/web` yet. No real call site exists to wire. |
| `risk.created` | Test-only | `apps/web/app/risk/new/page.tsx` renders a risk-intake form whose "Save draft risk" button is `type="button"` with no `formAction`/`onClick` — it does not submit. No server action or persistence path exists yet. |
| `risk.scored` | Test-only | Same root cause as `risk.created` — no real risk-scoring mutation path exists in `apps/web` yet. |
| `gap.detected` | Test-only | `apps/web/app/gaps/page.tsx` computes `GapAssessmentEngine.assess()` over hardcoded inputs (`40, index + 3`) purely for display; it is not a real, request-scoped gap-detection event with real entity ids. |
| `assessment.completed` | Test-only | `apps/web/app/assessment/[id]/page.tsx` reads a static fixture from `assessments` (`@/app/lib/mvp-data`) by id; there is no submission/completion action that transitions an assessment to completed. |
| `report.requested` | Test-only | `apps/web/app/reports/page.tsx` lists a static report catalog; no "generate"/"request" action exists yet. |
| `module.completed` | Test-only | `apps/web/app/learning/module/[id]/page.tsx` is a read-only lesson list from static `learningModules`/`lessons` fixtures; no completion action exists. |
| `lab.completed` | Test-only | `apps/web/app/labs/session/[id]/page.tsx` displays a static `lab.score`/`lab.deliverables`; no real lab-runner completion action exists. |
| `agent.failed` | Test-only (by design) | This event bypasses `AgentRuntime.submit()` entirely — `GovernanceSupervisorAgent.supervise()` inspects already-collected `AgentRunRecord[]`/`GovernanceDecisionLogEntry[]`/`RuntimeRecord[]` slices supplied by the caller. There is no separate "real" caller distinct from the admin Test Triggers panel, because `apps/web` does not (yet) collect/aggregate those record arrays anywhere in-process. Remains a fixture-driven test/demo path, consistent with the documented exception above. |

Only `framework.selected` had a genuine, pre-existing, real (non-test, non-demo) mutation
call site in `apps/web` with real `tenantId`/`userId`/entity data in scope at the time of this
batch — every other product surface in the table above is currently a **read-only page over
static MVP/demo data** (per `CLAUDE.md`'s "Zero empty states" rule), with no submit handler,
server action, or API route that performs the underlying business mutation yet. This is an
honest, current-state finding, not a wiring oversight: the agent-trigger-automation dispatcher
itself was always correct; what's missing is the upstream application mutation logic those 9
events would attach to. See `docs/agents/ZIG_AGENT_LIVE_WIRING.md` for full detail, including
the admin-side reuse (Task 2/3) that makes the existing test harness now show real accumulated
data within a process's lifetime.

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
