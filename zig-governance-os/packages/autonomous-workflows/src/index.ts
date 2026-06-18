export type AutonomousWorkflowType = "evidence_collection" | "risk_assessment" | "control_testing" | "vendor_review" | "policy_review" | "audit_preparation" | "certification_readiness";
export type AutonomousExecutionMode = "manual" | "assisted" | "autonomous" | "fully_autonomous";

export interface AutonomousWorkflowPlan {
  type: AutonomousWorkflowType;
  mode: AutonomousExecutionMode;
  approvalRequired: boolean;
}

export class AutonomousWorkflowOrchestrator {
  plan(type: AutonomousWorkflowType, mode: AutonomousExecutionMode): AutonomousWorkflowPlan {
    return { type, mode, approvalRequired: mode !== "manual" };
  }
}
