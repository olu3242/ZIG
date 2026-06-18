export interface CertificationReadinessInput { knowledge: number; practicalSkills: number; labCompletion: number; scenarioCompletion: number; capstones: number; interviewReadiness: number; }
export class CertificationReadinessEngine {
  score(input: CertificationReadinessInput): number {
    return Math.round((input.knowledge + input.practicalSkills + input.labCompletion + input.scenarioCompletion + input.capstones + input.interviewReadiness) / 6);
  }
}
