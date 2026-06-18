export type CopilotAction = "create_project" | "create_risk" | "generate_policy" | "generate_audit_plan" | "map_controls" | "generate_evidence_requests" | "create_vendor_assessment" | "generate_executive_briefing";

export interface CopilotContext {
  currentModule: string;
  currentFramework?: string;
  currentTenant: string;
  currentRole: string;
  currentTask?: string;
}

export class CopilotRuntime {
  plan(action: CopilotAction, context: CopilotContext): string {
    return `${action}:${context.currentTenant}:${context.currentRole}:${context.currentModule}`;
  }
}
