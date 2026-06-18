export type WorkforceOutput = "skill_gap_analysis" | "training_needs_analysis" | "certification_readiness" | "succession_planning" | "leadership_readiness" | "workforce_risk";
export class WorkforceDevelopmentEngine {
  outputs(): WorkforceOutput[] {
    return ["skill_gap_analysis", "training_needs_analysis", "certification_readiness", "succession_planning", "leadership_readiness", "workforce_risk"];
  }
}
