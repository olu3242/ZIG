export type RuntimeMetricType = "agent" | "workflow" | "queue" | "connector" | "api" | "compliance" | "risk" | "runtime" | "ai";
export interface RuntimeMetric {
  tenantId: string;
  type: RuntimeMetricType;
  name: string;
  value: number;
  observedAt: Date;
}
export class RuntimeTelemetry {
  metric(input: Omit<RuntimeMetric, "observedAt">): RuntimeMetric {
    return { ...input, observedAt: new Date() };
  }
  health(metrics: RuntimeMetric[]): number {
    if (metrics.length === 0) return 0;
    return Math.round(metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length);
  }
}
