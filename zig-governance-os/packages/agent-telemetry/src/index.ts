export type AgentTelemetrySignal = "executions" | "latency" | "errors" | "approvals" | "escalations" | "costs" | "performance" | "security_events";
export class AgentTelemetry {
  signals(): AgentTelemetrySignal[] {
    return ["executions", "latency", "errors", "approvals", "escalations", "costs", "performance", "security_events"];
  }
}
