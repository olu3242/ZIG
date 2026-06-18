export interface CareerReadinessInput {
  portfolioScore: number;
  certificationReadiness: number;
  interviewReadiness: number;
  practicalExperience: number;
}
export class CareerOS {
  readiness(input: CareerReadinessInput): number {
    return Math.round((input.portfolioScore + input.certificationReadiness + input.interviewReadiness + input.practicalExperience) / 4);
  }
  resumeHeadline(role: string, topSkill: string): string {
    return `${role} candidate with verified ${topSkill} practice experience`;
  }
}
