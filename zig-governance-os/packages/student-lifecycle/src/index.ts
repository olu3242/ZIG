export type StudentLifecycleStage = "prospect" | "new_learner" | "active_learner" | "practitioner" | "professional" | "lead" | "architect" | "certified" | "employment_ready" | "placed" | "mentor" | "instructor";
export class StudentLifecycleEngine {
  stages(): StudentLifecycleStage[] {
    return ["prospect", "new_learner", "active_learner", "practitioner", "professional", "lead", "architect", "certified", "employment_ready", "placed", "mentor", "instructor"];
  }
}
