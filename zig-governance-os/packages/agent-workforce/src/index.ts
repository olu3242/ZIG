export type HumanReviewDecision = "review" | "approve" | "reject" | "escalate" | "override";

export interface AgentAssignment {
  agentKey: string;
  ownerUserId: string;
  monitored: boolean;
  approvalRequired: boolean;
}

export class AgentWorkforceManager {
  assign(agentKey: string, ownerUserId: string): AgentAssignment {
    return { agentKey, ownerUserId, monitored: true, approvalRequired: true };
  }

  decide(decision: HumanReviewDecision): boolean {
    return decision === "approve" || decision === "override";
  }
}
