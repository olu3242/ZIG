import { AdaptiveLearningEngine, type SkillSignal } from "@zig/adaptive-learning";
import { AssessmentEngine, type AssessmentType } from "@zig/assessment-engine";
import { LearningPathGenerator } from "@zig/learning-paths";
import { orchestrateDomainAgent, type DomainAgentOutcome } from "@zig/agent-domain-intelligence";
import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest } from "@zig/agent-runtime";

export type LearningPathTriggeringEvent =
  | "user.onboarded"
  | "learning.started"
  | "lesson.completed"
  | "assessment.failed"
  | "assessment.passed"
  | "module.completed"
  | "framework.selected";

export type LearningPathAction =
  | "recommend_next_module"
  | "recommend_module_review"
  | "recommend_practice_lab"
  | "recommend_scenario"
  | "recommend_remediation"
  | "flag_no_signal";

export interface LearningPathLastAssessment {
  type: AssessmentType;
  score: number;
  remediationSkillIds?: string[];
}

export interface LearningPathInput {
  learnerId: string;
  triggeringEvent: LearningPathTriggeringEvent;
  skillSignals: SkillSignal[];
  frameworkCode?: string;
  lastAssessment?: LearningPathLastAssessment;
}

export interface LearningPathRecommendation {
  action: LearningPathAction;
  confidence: number;
  rationale: string;
  recommendedSkillId?: string;
  priority?: "low" | "medium" | "high";
  frameworkReference?: string;
  nextSteps: string[];
}

const adaptiveEngine = new AdaptiveLearningEngine();
const assessmentEngine = new AssessmentEngine();
const pathGenerator = new LearningPathGenerator();

const actionByEngineAction: Record<"review" | "practice_lab" | "scenario" | "capstone", LearningPathAction> = {
  review: "recommend_module_review",
  practice_lab: "recommend_practice_lab",
  scenario: "recommend_scenario",
  capstone: "recommend_practice_lab",
};

export function recommendLearningPath(input: LearningPathInput): LearningPathRecommendation {
  if (input.skillSignals.length === 0) {
    return {
      action: "flag_no_signal",
      confidence: 0.4,
      rationale: "No skill signals are available yet for this learner; defaulting to onboarding guidance.",
      nextSteps: ["Complete the onboarding assessment to generate skill signals."],
    };
  }

  if (input.triggeringEvent === "assessment.failed" && input.lastAssessment) {
    const graded = assessmentEngine.grade(
      input.lastAssessment.type,
      input.lastAssessment.score,
      input.lastAssessment.remediationSkillIds ?? [],
    );
    if (!graded.passed) {
      return {
        action: "recommend_remediation",
        confidence: 0.85,
        rationale: `Failed "${graded.type}" at ${graded.score}%; recommending remediation before re-attempting.`,
        recommendedSkillId: graded.remediationSkillIds[0],
        priority: "high",
        frameworkReference: input.frameworkCode,
        nextSteps: graded.remediationSkillIds.length
          ? graded.remediationSkillIds.map((skillId) => `Review and practice skill: ${skillId}`)
          : ["Review the assessment's missed objectives before retrying."],
      };
    }
  }

  const recommendations = adaptiveEngine.recommend(input.skillSignals);
  const top = recommendations[0];

  if (top) {
    return {
      action: actionByEngineAction[top.action],
      confidence: top.priority === "high" ? 0.8 : 0.65,
      rationale: `Skill "${top.skillId}" is below mastery threshold; recommending "${top.action}" at "${top.priority}" priority.`,
      recommendedSkillId: top.skillId,
      priority: top.priority,
      frameworkReference: input.frameworkCode,
      nextSteps: [`Work on skill "${top.skillId}" via the recommended "${top.action}" activity.`],
    };
  }

  const outputs = pathGenerator.outputs();
  return {
    action: "recommend_next_module",
    confidence: 0.75,
    rationale: `No weaknesses detected across ${input.skillSignals.length} skill signal(s); advancing to the next module.`,
    frameworkReference: input.frameworkCode,
    nextSteps: input.frameworkCode
      ? [`Continue toward the "${outputs[outputs.indexOf("certification_roadmap")]}" for ${input.frameworkCode}.`]
      : ["Continue to the next module in the current learning path."],
  };
}

export async function runLearningPathAgent(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: LearningPathInput,
  context: AgentRunRequest["context"],
  eventId: string,
): Promise<DomainAgentOutcome<LearningPathRecommendation>> {
  return orchestrateDomainAgent({
    runtime,
    guard,
    subject,
    agentId: "learning",
    resource: "learning",
    tool: "learning-engine",
    action: "view",
    context,
    eventId,
    domainEventType: input.triggeringEvent,
    goal: `Recommend a learning path for learner ${input.learnerId} triggered by ${input.triggeringEvent}.`,
    payload: { ...input },
    produce: () => recommendLearningPath(input),
    toDecision: (recommendation) => ({
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: [`learner:${input.learnerId}`, `skillSignals:${input.skillSignals.length}`],
      action: recommendation.action,
      frameworkReference: recommendation.frameworkReference,
    }),
  });
}
