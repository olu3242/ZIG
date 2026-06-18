export type SupervisorAgent = "learning_supervisor" | "compliance_supervisor" | "risk_supervisor" | "audit_supervisor" | "career_supervisor" | "executive_supervisor";
export class SupervisorAgentPlatform {
  supervisors(): SupervisorAgent[] {
    return ["learning_supervisor", "compliance_supervisor", "risk_supervisor", "audit_supervisor", "career_supervisor", "executive_supervisor"];
  }
}
