import { FrameworkIntelligenceEngine, type FrameworkReadiness } from "@zig/frameworks";

export type FrameworkReadinessInput = Omit<FrameworkReadiness, "health">;
import { ControlManagementEngine, type ControlAssessmentInput } from "@zig/controls";
import { CertificationReadinessEngine, type CertificationReadinessInput } from "@zig/certification-readiness";
import { orchestrateDomainAgent, type DomainAgentOutcome } from "@zig/agent-domain-intelligence";
import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest } from "@zig/agent-runtime";

export type ReadinessScoringTriggeringEvent =
  | "assessment.completed"
  | "control.updated"
  | "evidence.approved"
  | "framework.selected"
  | "report.requested";

export type ReadinessScoringAction =
  | "recommend_readiness_certification_ready"
  | "draft_readiness_assessment"
  | "flag_readiness_gaps"
  | "request_readiness_publication_approval";

export interface ReadinessScoringInput {
  subjectId: string;
  triggeringEvent: ReadinessScoringTriggeringEvent;
  framework: FrameworkReadinessInput;
  control: ControlAssessmentInput;
  learning: CertificationReadinessInput;
  organizationalMaturity: number;
  /** True when the caller is requesting an official, publishable readiness certification. */
  requestPublish?: boolean;
}

export interface ReadinessScoringRecommendation {
  action: ReadinessScoringAction;
  confidence: number;
  rationale: string;
  aggregateReadiness: number;
  weakAreas: string[];
  frameworkReference: string;
}

const READY_THRESHOLD = 75;
const WEAK_THRESHOLD = 60;

const frameworkEngine = new FrameworkIntelligenceEngine();
const controlEngine = new ControlManagementEngine();
const learningEngine = new CertificationReadinessEngine();

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function recommendReadinessScore(input: ReadinessScoringInput): ReadinessScoringRecommendation {
  const frameworkReadiness = frameworkEngine.score(input.framework);
  const controlAssessment = controlEngine.assess(input.control);
  const learningReadiness = learningEngine.score(input.learning);
  const maturity = clamp(input.organizationalMaturity);

  const dimensions: Array<[string, number]> = [
    ["frameworks", frameworkReadiness.readiness],
    ["controls", controlAssessment.effectiveness],
    ["learning", learningReadiness],
    ["organizational maturity", maturity],
  ];

  const aggregateReadiness = clamp(dimensions.reduce((sum, [, score]) => sum + score, 0) / dimensions.length);
  const weakAreas = dimensions.filter(([, score]) => score < WEAK_THRESHOLD).map(([name]) => name);

  const rationaleBase =
    `Aggregate readiness ${aggregateReadiness}% across frameworks (${frameworkReadiness.readiness}%), ` +
    `controls (${controlAssessment.effectiveness}%), learning (${learningReadiness}%), and organizational ` +
    `maturity (${maturity}%); ${frameworkReadiness.gapCount} framework gap(s) outstanding.`;

  if (input.requestPublish) {
    if (aggregateReadiness >= READY_THRESHOLD && weakAreas.length === 0) {
      return {
        action: "request_readiness_publication_approval",
        confidence: 0.85,
        rationale: `${rationaleBase} Readiness supports an official, publishable certification — routing for human approval.`,
        aggregateReadiness,
        weakAreas,
        frameworkReference: input.framework.frameworkCode,
      };
    }
    return {
      action: "flag_readiness_gaps",
      confidence: 0.7,
      rationale: `${rationaleBase} Publication was requested, but weak area(s) [${weakAreas.join(", ") || "below threshold overall"}] block official certification.`,
      aggregateReadiness,
      weakAreas,
      frameworkReference: input.framework.frameworkCode,
    };
  }

  if (aggregateReadiness >= READY_THRESHOLD) {
    return {
      action: "recommend_readiness_certification_ready",
      confidence: 0.8,
      rationale: `${rationaleBase} This is on track for certification readiness.`,
      aggregateReadiness,
      weakAreas,
      frameworkReference: input.framework.frameworkCode,
    };
  }

  return {
    action: "draft_readiness_assessment",
    confidence: 0.6,
    rationale: `${rationaleBase} Drafting a readiness assessment while weak area(s) [${weakAreas.join(", ") || "overall coverage"}] are addressed.`,
    aggregateReadiness,
    weakAreas,
    frameworkReference: input.framework.frameworkCode,
  };
}

export async function runReadinessScoringAgent(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: ReadinessScoringInput,
  context: AgentRunRequest["context"],
  eventId: string,
): Promise<DomainAgentOutcome<ReadinessScoringRecommendation>> {
  return orchestrateDomainAgent({
    runtime,
    guard,
    subject,
    agentId: "assessment",
    resource: "frameworks",
    tool: "assessment-engine",
    action: "view",
    approvalAction: input.requestPublish ? "readiness_scoring" : undefined,
    context,
    eventId,
    domainEventType: input.triggeringEvent,
    goal: `Score readiness for ${input.subjectId} triggered by ${input.triggeringEvent}.`,
    payload: { ...input },
    produce: () => recommendReadinessScore(input),
    toDecision: (recommendation) => ({
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: [`subject:${input.subjectId}`, `framework:${input.framework.frameworkCode}`],
      action: recommendation.action,
      frameworkReference: recommendation.frameworkReference,
    }),
  });
}
