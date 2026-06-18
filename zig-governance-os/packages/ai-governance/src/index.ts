export interface AiGovernancePolicy {
  agentPermissions: string[];
  approvalRequired: boolean;
  piiProtection: boolean;
  auditLogging: boolean;
  promptGovernance: boolean;
  modelGovernance: boolean;
}

export class AiGovernanceLayer {
  canExecute(policy: AiGovernancePolicy): boolean {
    return policy.auditLogging && policy.piiProtection && !policy.approvalRequired;
  }
}
