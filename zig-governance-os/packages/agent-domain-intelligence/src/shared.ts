import type { AccessSubject, RbacAction, RbacResource } from "@zig/governance-engine";
import { AgentGovernanceGuard, type AgentGovernanceResult, type ApprovalRequiredAction } from "@zig/agent-governance";
import { AgentRuntime, UnsupportedAgentEventError, type AgentRunRecord, type AgentRunRequest } from "@zig/agent-runtime";
import { getAgentById, type AgentDecision, type AgentId } from "@zig/agents";

/**
 * Shared orchestration shape for Batch 3 Domain Intelligence Agents. Each agent module
 * (framework-mapping, risk-assessment, control-advisor, policy-artifact) supplies its own
 * pure `produce()` recommendation function over its existing domain engine; this helper only
 * wires the unchanged Event -> Registry -> Governance Guard -> Runtime -> Decision ->
 * Audit path that @zig/agent-evidence-review already proved in Phase 2D. No domain logic
 * lives here.
 */
export interface DomainAgentOutcome<R> {
  run: AgentRunRecord;
  governance: AgentGovernanceResult;
  recommendation?: R;
  decision?: AgentDecision;
}

export interface OrchestrateDomainAgentInput<R> {
  runtime: AgentRuntime;
  guard: AgentGovernanceGuard;
  subject: AccessSubject;
  agentId: AgentId;
  resource: RbacResource;
  tool: string;
  action?: RbacAction;
  approvalAction?: ApprovalRequiredAction;
  context: AgentRunRequest["context"];
  eventId: string;
  domainEventType: string;
  goal: string;
  payload: Record<string, unknown>;
  produce: () => R;
  toDecision: (recommendation: R) => Omit<AgentDecision, "agentId" | "context">;
}

export async function orchestrateDomainAgent<R>(input: OrchestrateDomainAgentInput<R>): Promise<DomainAgentOutcome<R>> {
  const agent = getAgentById(input.agentId);
  if (!agent) {
    throw new UnsupportedAgentEventError(`No "${input.agentId}" agent is registered.`);
  }

  const request: AgentRunRequest = {
    eventId: input.eventId,
    source: "compliance_runtime",
    type: "agent_started",
    context: input.context,
    goal: input.goal,
    payload: { domainEventType: input.domainEventType, ...input.payload },
    agentId: input.agentId,
  };

  const { run, job } = input.runtime.submit(request);

  const governance = input.guard.evaluate({
    subject: input.subject,
    agent,
    context: input.context,
    resource: input.resource,
    action: input.action ?? "view",
    tool: input.tool,
    approvalAction: input.approvalAction,
  });

  if (!governance.allowed) {
    const stopped = await input.runtime.execute(run.id, job.id, request, agent, async () => {
      throw new Error(governance.deniedReason ?? "Governance denied execution.");
    });
    return { run: stopped, governance };
  }

  let recommendation: R | undefined;
  const completed = await input.runtime.execute(run.id, job.id, request, agent, async () => {
    recommendation = input.produce();
    return input.toDecision(recommendation);
  });

  return { run: completed, governance, recommendation, decision: completed.decision };
}

export function replayDomainAgent(runtime: AgentRuntime, runId: string): ReturnType<AgentRuntime["replay"]> {
  return runtime.replay(runId);
}
