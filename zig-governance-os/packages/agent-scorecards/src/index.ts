export interface AgentScorecardMetrics { accuracy: number; reliability: number; successRate: number; approvalRate: number; escalationRate: number; failureRate: number; recoveryRate: number; userSatisfaction: number; }
export type AgentRanking = "gold" | "silver" | "bronze" | "needs_review" | "suspended";
export class AgentScorecardEngine {
  score(metrics: AgentScorecardMetrics): number {
    return Math.round((metrics.accuracy + metrics.reliability + metrics.successRate + metrics.approvalRate + metrics.recoveryRate + metrics.userSatisfaction - metrics.escalationRate - metrics.failureRate) / 6);
  }
  ranking(score: number): AgentRanking {
    if (score >= 85) return "gold";
    if (score >= 72) return "silver";
    if (score >= 60) return "bronze";
    if (score >= 40) return "needs_review";
    return "suspended";
  }
}
