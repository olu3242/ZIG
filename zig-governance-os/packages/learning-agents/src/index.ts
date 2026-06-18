export type LearningAgentKey = "tutor" | "instructor" | "mentor" | "coach" | "reviewer" | "auditor" | "interviewer" | "career_advisor";
export interface LearningAgent {
  key: LearningAgentKey;
  mission: string;
  outputs: string[];
}
export const learningAgents: LearningAgent[] = [
  { key: "tutor", mission: "Teach concepts and answer questions.", outputs: ["explanations", "practice_questions"] },
  { key: "instructor", mission: "Deliver curriculum and assign work.", outputs: ["weekly_plan", "mastery_report"] },
  { key: "mentor", mission: "Guide long-term development.", outputs: ["growth_plan", "portfolio_recommendations"] },
  { key: "coach", mission: "Improve consistency and performance.", outputs: ["coaching_report", "study_recommendations"] },
  { key: "reviewer", mission: "Evaluate learner work products.", outputs: ["score", "strengths", "recommendations"] },
  { key: "auditor", mission: "Challenge evidence and control claims.", outputs: ["evidence_requests", "findings"] },
  { key: "interviewer", mission: "Conduct realistic career interviews.", outputs: ["interview_score", "weak_areas"] },
  { key: "career_advisor", mission: "Convert learning into employment.", outputs: ["career_readiness", "job_matches"] },
];
export class LearningAgentWorkforce {
  list(): LearningAgent[] {
    return learningAgents;
  }
}
