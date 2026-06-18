export interface AgentAuditRecord {
  agentId: string;
  inputHash: string;
  outputHash: string;
  reasoningSummary: string;
  confidence: number;
  approvals: string[];
  actions: string[];
  escalations: string[];
  failures: string[];
  recoveries: string[];
}
export class AgentAuditEngine {
  exportEvidence(record: AgentAuditRecord): string {
    return `${record.agentId}:${record.inputHash}:${record.outputHash}:${record.confidence}`;
  }
}
