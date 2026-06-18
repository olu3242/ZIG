export type LearningRuntimeStage = "assessment" | "skills_graph" | "learning_path" | "course" | "lab" | "scenario" | "capstone" | "portfolio" | "certification" | "career_readiness" | "mentorship" | "employment";
export class LearningRuntime {
  e2eFlow(): LearningRuntimeStage[] {
    return ["assessment", "skills_graph", "learning_path", "course", "lab", "scenario", "capstone", "portfolio", "certification", "career_readiness", "mentorship", "employment"];
  }
}
