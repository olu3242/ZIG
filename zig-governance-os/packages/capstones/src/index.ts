export type CapstoneProject = "iso_implementation" | "soc2_readiness" | "vendor_risk_program" | "internal_audit_program" | "risk_management_program" | "privacy_program";
export type CapstoneDeliverable = "risk_registers" | "policies" | "controls" | "evidence" | "audit_packages" | "executive_reports";
export class CapstoneEngine {
  deliverables(): CapstoneDeliverable[] {
    return ["risk_registers", "policies", "controls", "evidence", "audit_packages", "executive_reports"];
  }
}
