export type LearningKernelResponsibility = "student_registration" | "assessment_routing" | "learning_path_generation" | "agent_assignment" | "progress_tracking" | "certification_tracking" | "career_tracking" | "employment_tracking";
export class LearningKernel {
  responsibilities(): LearningKernelResponsibility[] {
    return ["student_registration", "assessment_routing", "learning_path_generation", "agent_assignment", "progress_tracking", "certification_tracking", "career_tracking", "employment_tracking"];
  }
}
