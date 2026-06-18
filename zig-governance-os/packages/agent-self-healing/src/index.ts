export type AgentFailureSignal = "failure" | "timeout" | "low_confidence" | "tool_failure" | "dependency_failure" | "repeated_error" | "policy_violation";
export type AgentRemediation = "retry" | "alternative_tool" | "alternative_strategy" | "alternative_agent" | "supervisor_agent" | "human_escalation" | "suspend_agent";
export class AgentSelfHealingEngine {
  remediate(signal: AgentFailureSignal): AgentRemediation {
    const map: Record<AgentFailureSignal, AgentRemediation> = {
      failure: "retry",
      timeout: "alternative_strategy",
      low_confidence: "supervisor_agent",
      tool_failure: "alternative_tool",
      dependency_failure: "alternative_agent",
      repeated_error: "human_escalation",
      policy_violation: "suspend_agent",
    };
    return map[signal];
  }
}
