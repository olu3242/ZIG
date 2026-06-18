export type AgentMemoryKind = "decision" | "recommendation" | "action" | "escalation" | "lesson";
export interface AgentMemoryRecord {
  tenantId: string;
  agentKey: string;
  kind: AgentMemoryKind;
  summary: string;
  confidence: number;
  createdAt: Date;
}
export class AgentMemoryStore {
  remember(input: Omit<AgentMemoryRecord, "createdAt">): AgentMemoryRecord {
    if (!input.summary.trim()) throw new Error("Agent memory summary is required.");
    return { ...input, confidence: clamp(input.confidence), createdAt: new Date() };
  }
}
function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}
