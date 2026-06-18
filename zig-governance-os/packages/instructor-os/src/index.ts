export type BuilderType = "course_builder" | "lab_builder" | "scenario_builder" | "assessment_builder" | "student_analytics";
export class InstructorOS {
  builders(): BuilderType[] {
    return ["course_builder", "lab_builder", "scenario_builder", "assessment_builder", "student_analytics"];
  }
}
