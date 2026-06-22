import { CareerOS, type CareerReadinessInput } from "@zig/career-os";
import { CredentialingPlatform } from "@zig/credentials";
import { orchestrateDomainAgent, type DomainAgentOutcome } from "@zig/agent-domain-intelligence";
import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest } from "@zig/agent-runtime";

export type CareerPortfolioTriggeringEvent =
  | "module.completed"
  | "lab.completed"
  | "artifact.approved"
  | "assessment.passed"
  | "readiness.updated"
  | "portfolio.requested";

export type CareerPortfolioAction =
  | "draft_portfolio_summary"
  | "recommend_certification_readiness"
  | "flag_not_ready"
  | "request_portfolio_publish_approval";

export interface CareerPortfolioInput extends CareerReadinessInput {
  learnerId: string;
  triggeringEvent: CareerPortfolioTriggeringEvent;
  topSkill: string;
  targetRole: string;
  /** True when the learner wants to publish externally, export official proof-of-work, or claim formal certification readiness. */
  requestPublish?: boolean;
}

const READY_THRESHOLD = 75;

export interface CareerPortfolioRecommendation {
  action: CareerPortfolioAction;
  confidence: number;
  rationale: string;
  readinessScore: number;
  resumeHeadline?: string;
  nextSteps: string[];
}

const careerOS = new CareerOS();
const credentialPlatform = new CredentialingPlatform();

export function recommendCareerPortfolio(input: CareerPortfolioInput): CareerPortfolioRecommendation {
  const readinessScore = careerOS.readiness(input);
  const resumeHeadline = careerOS.resumeHeadline(input.targetRole, input.topSkill);

  if (input.requestPublish) {
    if (readinessScore < READY_THRESHOLD) {
      return {
        action: "flag_not_ready",
        confidence: 0.7,
        rationale: `Readiness score is ${readinessScore}%, below the ${READY_THRESHOLD}% threshold required to publish externally or claim certification readiness.`,
        readinessScore,
        nextSteps: ["Raise portfolio score, interview readiness, or practical experience before requesting publication."],
      };
    }
    return {
      action: "request_portfolio_publish_approval",
      confidence: 0.85,
      rationale: `Readiness score is ${readinessScore}%; drafting a publish/certification-readiness claim for ${input.learnerId}. ` +
        "Human approval is required before this is published or marked official.",
      readinessScore,
      resumeHeadline,
      nextSteps: [`Available credential types: ${credentialPlatform.credentialTypes().join(", ")}.`],
    };
  }

  if (readinessScore >= READY_THRESHOLD) {
    return {
      action: "recommend_certification_readiness",
      confidence: 0.8,
      rationale: `Readiness score is ${readinessScore}%; this learner is on track for certification readiness review.`,
      readinessScore,
      resumeHeadline,
      nextSteps: ["Request a formal certification-readiness review when ready to publish."],
    };
  }

  return {
    action: "draft_portfolio_summary",
    confidence: 0.6,
    rationale: `Readiness score is ${readinessScore}%; drafting a portfolio summary while readiness continues to build.`,
    readinessScore,
    resumeHeadline,
    nextSteps: ["Complete additional labs, capstones, or interview practice to raise readiness."],
  };
}

export async function runCareerPortfolioAgent(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: CareerPortfolioInput,
  context: AgentRunRequest["context"],
  eventId: string,
): Promise<DomainAgentOutcome<CareerPortfolioRecommendation>> {
  return orchestrateDomainAgent({
    runtime,
    guard,
    subject,
    agentId: "certification",
    resource: "learning",
    tool: "certification-engine",
    action: "create",
    approvalAction: input.requestPublish ? "readiness_scoring" : undefined,
    context,
    eventId,
    domainEventType: input.triggeringEvent,
    goal: `Build a career portfolio recommendation for learner ${input.learnerId} triggered by ${input.triggeringEvent}.`,
    payload: { ...input },
    produce: () => recommendCareerPortfolio(input),
    toDecision: (recommendation) => ({
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: [`learner:${input.learnerId}`, `targetRole:${input.targetRole}`],
      action: recommendation.action,
    }),
  });
}
