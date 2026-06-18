export type AgentApprovalLevel = 1 | 2 | 3 | 4 | 5;
export type AgentApprovalDecision = "requested" | "review" | "approved" | "rejected";
export interface AgentApprovalWorkflow {
  level: AgentApprovalLevel;
  label: string;
  decision: AgentApprovalDecision;
}
export class AgentApprovalEngine {
  request(level: AgentApprovalLevel): AgentApprovalWorkflow {
    const labels: Record<AgentApprovalLevel, string> = { 1: "routine", 2: "business_impact", 3: "compliance_impact", 4: "financial_impact", 5: "executive_approval" };
    return { level, label: labels[level], decision: "requested" };
  }
}
