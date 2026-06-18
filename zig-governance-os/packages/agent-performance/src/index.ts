export interface AgentPerformanceMetrics { teachingQuality: number; studentSuccess: number; assessmentAccuracy: number; certificationSuccess: number; employmentSuccess: number; mentorEffectiveness: number; }
export class AgentPerformanceEngine {
  score(metrics: AgentPerformanceMetrics): number {
    return Math.round((metrics.teachingQuality + metrics.studentSuccess + metrics.assessmentAccuracy + metrics.certificationSuccess + metrics.employmentSuccess + metrics.mentorEffectiveness) / 6);
  }
}
