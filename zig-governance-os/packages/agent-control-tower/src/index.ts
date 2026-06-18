export interface AgentControlTowerSnapshot {
  inventory: number;
  active: number;
  degraded: number;
  escalations: number;
  approvals: number;
  certificationAverage: number;
  riskScore: number;
  cost: number;
  utilization: number;
}
export class AgentControlTower {
  health(snapshot: AgentControlTowerSnapshot): number {
    return Math.max(0, Math.min(100, Math.round(100 - snapshot.degraded * 10 - snapshot.escalations * 5 - snapshot.riskScore / 2)));
  }
}
