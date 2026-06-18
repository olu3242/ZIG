export type AiComplianceService =
  | "control_mapping"
  | "framework_crosswalk"
  | "risk_analysis"
  | "gap_analysis"
  | "policy_drafting"
  | "audit_preparation"
  | "evidence_classification"
  | "control_recommendations";

export interface AiComplianceRequest {
  service: AiComplianceService;
  tenantId: string;
  prompt: string;
  context: Record<string, unknown>;
}

export interface AiCompliancePlan {
  service: AiComplianceService;
  requiresHumanReview: true;
  auditLabel: string;
  prompt: string;
}

export class AiComplianceEngine {
  plan(request: AiComplianceRequest): AiCompliancePlan {
    if (!request.tenantId || !request.prompt.trim()) {
      throw new Error("tenantId and prompt are required.");
    }

    return {
      service: request.service,
      requiresHumanReview: true,
      auditLabel: `ai.${request.service}`,
      prompt: request.prompt,
    };
  }
}
