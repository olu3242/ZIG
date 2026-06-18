export interface WorkforceAnalyticsInput { learningVelocity: number; certificationRate: number; skillGrowth: number; careerProgression: number; placementRate: number; promotionRate: number; employerSatisfaction: number; trainingRoi: number; }
export class WorkforceAnalytics {
  score(input: WorkforceAnalyticsInput): number {
    return Math.round((input.learningVelocity + input.certificationRate + input.skillGrowth + input.careerProgression + input.placementRate + input.promotionRate + input.employerSatisfaction + input.trainingRoi) / 8);
  }
}
