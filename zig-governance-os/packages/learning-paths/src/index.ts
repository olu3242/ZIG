export type LearningPlanOutput = "daily_plan" | "weekly_plan" | "monthly_plan" | "certification_roadmap" | "career_roadmap";
export class LearningPathGenerator {
  outputs(): LearningPlanOutput[] {
    return ["daily_plan", "weekly_plan", "monthly_plan", "certification_roadmap", "career_roadmap"];
  }
}
