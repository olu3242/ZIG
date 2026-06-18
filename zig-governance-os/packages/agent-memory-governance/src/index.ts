export type GovernedMemoryStore = "working" | "long_term" | "learning" | "compliance" | "risk" | "student";
export interface MemoryGovernancePolicy {
  store: GovernedMemoryStore;
  retentionDays: number;
  encrypted: boolean;
  auditable: boolean;
  accessControl: boolean;
}
export class AgentMemoryGovernance {
  compliant(policy: MemoryGovernancePolicy): boolean {
    return policy.retentionDays > 0 && policy.encrypted && policy.auditable && policy.accessControl;
  }
}
