export interface AgentLedgerEntry {
  tenantId: string;
  agentId: string;
  version: number;
  previousHash?: string;
  inputHash: string;
  outputHash: string;
  reasoningHash: string;
  confidence: number;
  approvals: string[];
  escalations: string[];
  failures: string[];
  recoveries: string[];
}
export class AgentLedger {
  append(entry: AgentLedgerEntry): AgentLedgerEntry {
    if (entry.version < 1) throw new Error("Ledger version must be positive.");
    return { ...entry, confidence: Math.max(0, Math.min(100, entry.confidence)) };
  }
  evidenceKey(entry: AgentLedgerEntry): string {
    return `${entry.tenantId}:${entry.agentId}:v${entry.version}`;
  }
}
