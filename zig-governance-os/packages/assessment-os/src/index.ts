export interface AssessmentOSScore {
  knowledge: number;
  skill: number;
  competency: number;
  confidence: number;
  mastery: number;
}
export class AssessmentOS {
  composite(score: AssessmentOSScore): number {
    return Math.round((score.knowledge + score.skill + score.competency + score.confidence + score.mastery) / 5);
  }
}
