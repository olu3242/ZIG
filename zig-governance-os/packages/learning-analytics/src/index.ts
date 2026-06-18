export interface LearningMetrics {
  learningVelocity: number;
  skillVelocity: number;
  completionRate: number;
  careerReadiness: number;
  certificationReadiness: number;
  jobReadiness: number;
}
export class LearningAnalytics {
  operatingScore(metrics: LearningMetrics): number {
    return Math.round((metrics.learningVelocity + metrics.skillVelocity + metrics.completionRate + metrics.careerReadiness + metrics.certificationReadiness + metrics.jobReadiness) / 6);
  }
}
