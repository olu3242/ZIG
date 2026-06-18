export type ApprovalDecision = "pending" | "approved" | "rejected" | "escalated" | "overridden";
export interface ApprovalRequest {
  tenantId: string;
  subjectType: "agent_run" | "workflow_run" | "connector_job" | "board_report";
  subjectId: string;
  requestedBy: string;
  decision: ApprovalDecision;
}
export class ApprovalEngine {
  request(input: Omit<ApprovalRequest, "decision">): ApprovalRequest {
    return { ...input, decision: "pending" };
  }
  decide(request: ApprovalRequest, decision: Exclude<ApprovalDecision, "pending">): ApprovalRequest {
    return { ...request, decision };
  }
  executable(request: ApprovalRequest): boolean {
    return request.decision === "approved" || request.decision === "overridden";
  }
}
