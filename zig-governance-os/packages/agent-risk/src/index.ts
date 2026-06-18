export type AgentRiskType = "hallucination" | "unauthorized_action" | "prompt_injection" | "data_leakage" | "runaway_execution" | "infinite_loop" | "incorrect_recommendation" | "privilege_escalation";
export interface AgentRiskSignal { type: AgentRiskType; likelihood: number; impact: number; }
export class AgentRiskManager {
  score(signals: AgentRiskSignal[]): number {
    if (signals.length === 0) return 0;
    return Math.round(signals.reduce((sum, signal) => sum + signal.likelihood * signal.impact, 0) / signals.length);
  }
  mitigation(type: AgentRiskType): string {
    return `Mitigate ${type} with policy gate, audit trail, approval threshold, and supervisor review.`;
  }
}
