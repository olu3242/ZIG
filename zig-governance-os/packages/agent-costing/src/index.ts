export interface AgentCostFeed {
  costPerAgent: number;
  costPerWorkflow: number;
  costPerTenant: number;
  costPerStudent: number;
  costPerAssessment: number;
  costPerReport: number;
}
export class AgentCosting {
  dailyCost(feed: AgentCostFeed): number {
    return Number(Object.values(feed).reduce((sum, value) => sum + value, 0).toFixed(2));
  }
  forecast(feed: AgentCostFeed, days: number): number {
    return Number((this.dailyCost(feed) * days).toFixed(2));
  }
}
