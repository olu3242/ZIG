export type LearningEscalationTrigger = "low_confidence" | "low_progress" | "repeated_failure" | "certification_risk" | "career_risk";
export class LearningOrchestrator {
  route(trigger: LearningEscalationTrigger): "mentor_intervention" {
    return "mentor_intervention";
  }
}
