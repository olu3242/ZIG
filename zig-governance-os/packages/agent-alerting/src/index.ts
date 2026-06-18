export type AgentAlertChannel = "email" | "slack" | "teams" | "webhook" | "pagerduty";
export type AgentAlertType = "prompt_injection" | "unauthorized_action" | "data_leakage" | "agent_failure" | "escalation_failure" | "approval_failure" | "suspicious_behavior";
export interface AgentAlertRoute {
  type: AgentAlertType;
  severity: "critical" | "high" | "medium" | "low";
  channels: AgentAlertChannel[];
}
export class AgentAlerting {
  route(type: AgentAlertType, severity: AgentAlertRoute["severity"]): AgentAlertRoute {
    const channels: AgentAlertChannel[] = severity === "critical" ? ["email", "slack", "pagerduty"] : ["email", "slack"];
    return { type, severity, channels };
  }
}
