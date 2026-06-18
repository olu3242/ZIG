export type ObservabilityDashboard = "system_health" | "runtime_health" | "agent_health" | "connector_health" | "compliance_health" | "platform_health";
export class ObservabilityPlatform {
  dashboards(): ObservabilityDashboard[] {
    return ["system_health", "runtime_health", "agent_health", "connector_health", "compliance_health", "platform_health"];
  }
}
