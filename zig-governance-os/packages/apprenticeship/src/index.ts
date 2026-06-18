export type ApprenticeshipPersona = "manager" | "ciso" | "auditor" | "vendor" | "regulator" | "customer" | "board_member" | "risk_officer" | "compliance_officer";
export type ApprenticeshipObject = "assets" | "risks" | "controls" | "policies" | "audits" | "vendors" | "employees" | "incidents" | "board" | "regulators" | "customers";
export class ApprenticeshipEngine {
  personas(): ApprenticeshipPersona[] {
    return ["manager", "ciso", "auditor", "vendor", "regulator", "customer", "board_member", "risk_officer", "compliance_officer"];
  }
  operatingObjects(): ApprenticeshipObject[] {
    return ["assets", "risks", "controls", "policies", "audits", "vendors", "employees", "incidents", "board", "regulators", "customers"];
  }
}
