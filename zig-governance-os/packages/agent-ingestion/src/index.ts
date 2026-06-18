export type AgentEventSource = "agent_runtime" | "workflow_runtime" | "learning_runtime" | "compliance_runtime" | "risk_runtime" | "audit_runtime" | "career_runtime";
export type AgentEventType = "agent_started" | "agent_completed" | "agent_failed" | "agent_escalated" | "agent_approved" | "agent_rejected" | "agent_suspended" | "agent_recovered";
export interface AgentEventEnvelope {
  tenantId: string;
  agentId: string;
  source: AgentEventSource;
  type: AgentEventType;
  occurredAt: Date;
  payload: Record<string, unknown>;
}
export class AgentIngestion {
  ingest(input: Omit<AgentEventEnvelope, "occurredAt">): AgentEventEnvelope {
    return { ...input, occurredAt: new Date() };
  }
  streamKey(event: AgentEventEnvelope): string {
    return `${event.tenantId}:${event.source}:${event.agentId}`;
  }
}
