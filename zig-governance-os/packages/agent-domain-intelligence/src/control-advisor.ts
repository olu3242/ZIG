import { ControlManagementEngine, type ControlAssessmentInput } from "@zig/controls";
import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest } from "@zig/agent-runtime";
import { orchestrateDomainAgent, type DomainAgentOutcome } from "./shared";

/**
 * Control Advisor Agent — orchestrates the existing @zig/controls ControlManagementEngine.
 * No control effectiveness math is reimplemented here; the agent classifies the engine's
 * existing assessment into a recommendation and implementation guidance.
 */

export type ControlAdvisorAction =
  | "recommend_control_strengthening"
  | "recommend_control_acceptance"
  | "flag_control_gap"
  | "flag_control_exception";

export interface ControlAdvisorInput extends ControlAssessmentInput {
  controlId: string;
  frameworkReference?: string;
  triggeringEvent: "risk.scored" | "framework.selected" | "control.requested";
}

export interface ControlAdvisorRecommendation {
  action: ControlAdvisorAction;
  confidence: number;
  rationale: string;
  effectiveness: number;
  lifecycle: ReturnType<ControlManagementEngine["assess"]>["lifecycle"];
  implementationGuidance: string;
}

const engine = new ControlManagementEngine();

export function recommendControlAdvice(input: ControlAdvisorInput): ControlAdvisorRecommendation {
  const assessment = engine.assess(input);

  if (input.hasOpenException) {
    return {
      action: "flag_control_exception",
      confidence: 0.8,
      rationale: `Control ${input.controlId} has an open exception; effectiveness is ${assessment.effectiveness}%.`,
      effectiveness: assessment.effectiveness,
      lifecycle: assessment.lifecycle,
      implementationGuidance: "Resolve the open exception before relying on this control for framework coverage.",
    };
  }

  if (assessment.score === "not_implemented" || assessment.score === "partially_implemented") {
    return {
      action: "flag_control_gap",
      confidence: 0.75,
      rationale: `Control ${input.controlId} is "${assessment.score}" (effectiveness ${assessment.effectiveness}%)` +
        (input.frameworkReference ? ` against ${input.frameworkReference}.` : "."),
      effectiveness: assessment.effectiveness,
      lifecycle: assessment.lifecycle,
      implementationGuidance: "Implement the control and collect supporting evidence to raise effectiveness above 50%.",
    };
  }

  if (assessment.score === "implemented") {
    return {
      action: "recommend_control_strengthening",
      confidence: 0.7,
      rationale: `Control ${input.controlId} is implemented but not yet effective (${assessment.effectiveness}%).`,
      effectiveness: assessment.effectiveness,
      lifecycle: assessment.lifecycle,
      implementationGuidance: "Increase test pass rate and evidence coverage to reach the effective threshold (75%).",
    };
  }

  return {
    action: "recommend_control_acceptance",
    confidence: 0.9,
    rationale: `Control ${input.controlId} is "${assessment.score}" (effectiveness ${assessment.effectiveness}%); meets framework expectations.`,
    effectiveness: assessment.effectiveness,
    lifecycle: assessment.lifecycle,
    implementationGuidance: "No action required; continue periodic testing per the control's monitoring cadence.",
  };
}

export async function runControlAdvisorAgent(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: ControlAdvisorInput,
  context: AgentRunRequest["context"],
  eventId: string,
): Promise<DomainAgentOutcome<ControlAdvisorRecommendation>> {
  return orchestrateDomainAgent({
    runtime,
    guard,
    subject,
    agentId: "control",
    resource: "controls",
    tool: "control-engine",
    action: "view",
    context,
    eventId,
    domainEventType: input.triggeringEvent,
    goal: `Advise on control ${input.controlId} triggered by ${input.triggeringEvent}.`,
    payload: { ...input },
    produce: () => recommendControlAdvice(input),
    toDecision: (recommendation) => ({
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: [`control:${input.controlId}`],
      action: recommendation.action,
      frameworkReference: input.frameworkReference,
    }),
  });
}
