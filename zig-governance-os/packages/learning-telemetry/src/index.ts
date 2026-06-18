export type LearningTelemetryMetric = "learning_velocity" | "retention" | "assessment_scores" | "lab_completion" | "scenario_completion" | "certification_progress" | "career_progress" | "employment_progress";
export class LearningTelemetry {
  metrics(): LearningTelemetryMetric[] {
    return ["learning_velocity", "retention", "assessment_scores", "lab_completion", "scenario_completion", "certification_progress", "career_progress", "employment_progress"];
  }
}
