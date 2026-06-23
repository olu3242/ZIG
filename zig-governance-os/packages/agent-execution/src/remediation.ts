import { RiskManagementEngine, type RiskScoreInput } from "@zig/risks";
import { ControlManagementEngine, type ControlAssessmentInput } from "@zig/controls";
import { EvidenceManagementEngine, type EvidenceHealthInput } from "@zig/evidence";
import { orchestrateDomainAgent, type DomainAgentOutcome } from "@zig/agent-domain-intelligence";
import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest } from "@zig/agent-runtime";

export type RemediationTriggeringEvent =
  | "gap.detected"
  | "control.failed"
  | "evidence.missing"
  | "risk.high"
  | "assessment.completed";

export type RemediationPriority = "critical" | "high" | "medium" | "low";

export interface RemediationInput {
  subjectId: string;
  triggeringEvent: RemediationTriggeringEvent;
  findingSummary: string;
  risk: RiskScoreInput;
  control: ControlAssessmentInput;
  evidence: EvidenceHealthInput;
  candidateOwner: string;
}

export interface RemediationRecommendation {
  action: "recommend_remediation_plan" | "request_high_risk_approval";
  confidence: number;
  rationale: string;
  priority: RemediationPriority;
  recommendedOwner: string;
  estimatedEffortDays: number;
  suggestedDueInDays: number;
  dependencies: string[];
}

const riskEngine = new RiskManagementEngine();
const controlEngine = new ControlManagementEngine();
const evidenceEngine = new EvidenceManagementEngine();

function priorityFromRiskBand(band: ReturnType<RiskManagementEngine["score"]>["band"]): RemediationPriority {
  if (band === "critical") return "critical";
  if (band === "high") return "high";
  if (band === "medium") return "medium";
  return "low";
}

function effortFromPriority(priority: RemediationPriority): { effortDays: number; dueInDays: number } {
  switch (priority) {
    case "critical":
      return { effortDays: 5, dueInDays: 3 };
    case "high":
      return { effortDays: 8, dueInDays: 7 };
    case "medium":
      return { effortDays: 13, dueInDays: 21 };
    default:
      return { effortDays: 20, dueInDays: 45 };
  }
}

export function recommendRemediation(input: RemediationInput): RemediationRecommendation {
  const riskScore = riskEngine.score(input.risk);
  const controlAssessment = controlEngine.assess(input.control);
  const evidenceHealth = evidenceEngine.health(input.evidence);

  const priority = priorityFromRiskBand(riskScore.band);
  const { effortDays, dueInDays } = effortFromPriority(priority);

  const dependencies: string[] = [];
  if (evidenceHealth === "missing" || evidenceHealth === "expired" || evidenceHealth === "rejected") {
    dependencies.push(`evidence:${evidenceHealth}`);
  }
  if (controlAssessment.lifecycle === "exception" || controlAssessment.lifecycle === "draft") {
    dependencies.push(`control:${controlAssessment.lifecycle}`);
  }

  const rationaleBase =
    `Finding "${input.findingSummary}" (${input.triggeringEvent}) carries residual risk ` +
    `${riskScore.residualRisk}% (${riskScore.band}); control effectiveness ${controlAssessment.effectiveness}% ` +
    `(${controlAssessment.score}); evidence is ${evidenceHealth}.`;

  if (priority === "critical" || priority === "high") {
    return {
      action: "request_high_risk_approval",
      confidence: 0.85,
      rationale: `${rationaleBase} Recommending remediation owned by ${input.candidateOwner}, escalated for high-risk approval before assignment.`,
      priority,
      recommendedOwner: input.candidateOwner,
      estimatedEffortDays: effortDays,
      suggestedDueInDays: dueInDays,
      dependencies,
    };
  }

  return {
    action: "recommend_remediation_plan",
    confidence: 0.7,
    rationale: `${rationaleBase} Recommending a ${priority}-priority remediation plan owned by ${input.candidateOwner}.`,
    priority,
    recommendedOwner: input.candidateOwner,
    estimatedEffortDays: effortDays,
    suggestedDueInDays: dueInDays,
    dependencies,
  };
}

export async function runRemediationAgent(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: RemediationInput,
  context: AgentRunRequest["context"],
  eventId: string,
): Promise<DomainAgentOutcome<RemediationRecommendation>> {
  const riskBand = riskEngine.score(input.risk).band;
  const isHighRisk = riskBand === "critical" || riskBand === "high";

  return orchestrateDomainAgent({
    runtime,
    guard,
    subject,
    agentId: "audit",
    resource: "tasks",
    tool: "audit-engine",
    action: "view",
    approvalAction: isHighRisk ? "high_risk_recommendation" : undefined,
    context,
    eventId,
    domainEventType: input.triggeringEvent,
    goal: `Recommend remediation for ${input.subjectId} triggered by ${input.triggeringEvent}.`,
    payload: { ...input },
    produce: () => recommendRemediation(input),
    toDecision: (recommendation) => ({
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: [`subject:${input.subjectId}`, `finding:${input.findingSummary}`],
      action: recommendation.action,
    }),
  });
}
