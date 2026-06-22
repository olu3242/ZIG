import { RiskManagementEngine, type RiskScoreInput, type TreatmentStrategy } from "@zig/risks";
import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest } from "@zig/agent-runtime";
import { orchestrateDomainAgent, type DomainAgentOutcome } from "./shared";

/**
 * Risk Assessment Agent — orchestrates the existing @zig/risks RiskManagementEngine.score().
 * No inherent/residual risk math is reimplemented here; the agent only classifies the score
 * into a treatment recommendation and explains why.
 */

export type RiskAssessmentAction =
  | "recommend_treatment_mitigate"
  | "recommend_treatment_transfer"
  | "recommend_treatment_accept"
  | "recommend_treatment_avoid";

export interface RiskAssessmentInput extends RiskScoreInput {
  riskId: string;
  triggeringEvent: "risk.created" | "assessment.started" | "evidence.rejected" | "control.failed";
}

export interface RiskAssessmentRecommendation {
  action: RiskAssessmentAction;
  confidence: number;
  rationale: string;
  inherentRisk: number;
  residualRisk: number;
  band: ReturnType<RiskManagementEngine["score"]>["band"];
  suggestedOwner: string;
  priority: "p1" | "p2" | "p3" | "p4";
}

const engine = new RiskManagementEngine();

const treatmentByBand: Record<RiskAssessmentRecommendation["band"], TreatmentStrategy> = {
  critical: "mitigate",
  high: "mitigate",
  medium: "mitigate",
  low: "accept",
  informational: "accept",
};

const actionByTreatment: Record<TreatmentStrategy, RiskAssessmentAction> = {
  mitigate: "recommend_treatment_mitigate",
  transfer: "recommend_treatment_transfer",
  accept: "recommend_treatment_accept",
  avoid: "recommend_treatment_avoid",
};

const ownerByBand: Record<RiskAssessmentRecommendation["band"], string> = {
  critical: "Risk Owner (escalated to Tenant Admin)",
  high: "Risk Owner",
  medium: "Risk Owner",
  low: "Asset Owner",
  informational: "Asset Owner",
};

const priorityByBand: Record<RiskAssessmentRecommendation["band"], RiskAssessmentRecommendation["priority"]> = {
  critical: "p1",
  high: "p2",
  medium: "p3",
  low: "p4",
  informational: "p4",
};

export function recommendRiskTreatment(input: RiskAssessmentInput): RiskAssessmentRecommendation {
  const score = engine.score(input);
  const treatment = treatmentByBand[score.band];

  return {
    action: actionByTreatment[treatment],
    confidence: score.band === "critical" || score.band === "high" ? 0.85 : 0.65,
    rationale: `Inherent risk ${score.inherentRisk}, residual risk ${score.residualRisk} (band: ${score.band}); ` +
      `triggered by ${input.triggeringEvent}. Recommending treatment "${treatment}".`,
    inherentRisk: score.inherentRisk,
    residualRisk: score.residualRisk,
    band: score.band,
    suggestedOwner: ownerByBand[score.band],
    priority: priorityByBand[score.band],
  };
}

export async function runRiskAssessmentAgent(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: RiskAssessmentInput,
  context: AgentRunRequest["context"],
  eventId: string,
): Promise<DomainAgentOutcome<RiskAssessmentRecommendation>> {
  return orchestrateDomainAgent({
    runtime,
    guard,
    subject,
    agentId: "risk",
    resource: "risks",
    tool: "risk-engine",
    action: "view",
    context,
    eventId,
    domainEventType: input.triggeringEvent,
    goal: `Assess risk ${input.riskId} triggered by ${input.triggeringEvent}.`,
    payload: { ...input },
    produce: () => recommendRiskTreatment(input),
    toDecision: (recommendation) => ({
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: [`risk:${input.riskId}`],
      action: recommendation.action,
    }),
  });
}
