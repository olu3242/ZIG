export type RiskSignal = "control_failures" | "audit_findings" | "vendor_changes" | "threat_intelligence" | "policy_violations" | "configuration_drift";

export interface AutonomousRiskSignal {
  signal: RiskSignal;
  severity: number;
  confidence: number;
}

export class AutonomousRiskEngine {
  prioritize(signals: AutonomousRiskSignal[]): number {
    if (signals.length === 0) return 0;
    const score = signals.reduce((sum, signal) => sum + signal.severity * signal.confidence, 0) / signals.length;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  recommendation(score: number): string {
    if (score >= 80) return "Escalate and initiate treatment plan.";
    if (score >= 50) return "Review controls and assign owner.";
    return "Monitor trend and retain signal history.";
  }
}
