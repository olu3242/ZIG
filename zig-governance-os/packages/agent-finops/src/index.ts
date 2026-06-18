export interface AgentCostMetrics { tokenUsage: number; modelCosts: number; executionCosts: number; departmentCosts: number; tenantCosts: number; roi: number; }
export class AgentFinOps {
  totalCost(metrics: AgentCostMetrics): number {
    return Number((metrics.modelCosts + metrics.executionCosts + metrics.departmentCosts + metrics.tenantCosts).toFixed(2));
  }
  recommendation(metrics: AgentCostMetrics): string {
    return metrics.roi >= 1 ? "Maintain current model routing." : "Optimize model tier, cache outputs, and reduce retries.";
  }
}
