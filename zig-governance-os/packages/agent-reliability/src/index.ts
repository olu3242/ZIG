export interface AgentReliabilityMetrics {
  mttrMinutes: number;
  mtbfHours: number;
  recoveryRate: number;
  escalationRate: number;
  failureRate: number;
  approvalAccuracy: number;
  confidenceAccuracy: number;
}
export class AgentReliability {
  score(metrics: AgentReliabilityMetrics): number {
    return Math.max(0, Math.min(100, Math.round((metrics.recoveryRate + metrics.approvalAccuracy + metrics.confidenceAccuracy + metrics.mtbfHours / 2 - metrics.mttrMinutes - metrics.escalationRate - metrics.failureRate) / 2)));
  }
}
