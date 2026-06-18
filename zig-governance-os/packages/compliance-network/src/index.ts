export type ComplianceNetworkSignal = "benchmark" | "regulatory_exchange" | "risk_intelligence" | "control_intelligence" | "certification_intelligence" | "industry_intelligence";
export class ComplianceNetwork {
  signal(type: ComplianceNetworkSignal, industry: string): string {
    return `${type}:${industry.toLowerCase().replaceAll(" ", "_")}`;
  }
}
