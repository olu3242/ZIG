export type AssessmentType = "quiz" | "exam" | "scenario_exam" | "lab_validation" | "capstone_grading" | "practical_exam";
export interface AssessmentResult {
  type: AssessmentType;
  score: number;
  passed: boolean;
  remediationSkillIds: string[];
}
export class AssessmentEngine {
  grade(type: AssessmentType, score: number, remediationSkillIds: string[] = []): AssessmentResult {
    return { type, score: clamp(score), passed: score >= 75, remediationSkillIds };
  }
}
function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
