export type LearningMissionStage = "beginner" | "practitioner" | "professional" | "lead" | "architect" | "executive";
export class LearningOperatingSystem {
  missionPath(): LearningMissionStage[] {
    return ["beginner", "practitioner", "professional", "lead", "architect", "executive"];
  }
}
