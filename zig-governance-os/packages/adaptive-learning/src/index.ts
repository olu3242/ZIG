export interface SkillSignal {
  skillId: string;
  score: number;
  confidence: number;
}
export interface AdaptiveRecommendation {
  skillId: string;
  priority: "low" | "medium" | "high";
  action: "review" | "practice_lab" | "scenario" | "capstone";
}
export class AdaptiveLearningEngine {
  detectWeaknesses(signals: SkillSignal[]): SkillSignal[] {
    return signals.filter((signal) => signal.score < 70).sort((a, b) => a.score - b.score);
  }
  recommend(signals: SkillSignal[]): AdaptiveRecommendation[] {
    return this.detectWeaknesses(signals).map((signal) => ({
      skillId: signal.skillId,
      priority: signal.score < 45 ? "high" : "medium",
      action: signal.score < 45 ? "practice_lab" : "scenario",
    }));
  }
}
