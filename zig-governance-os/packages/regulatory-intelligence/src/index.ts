export type RegulatorySource = "nist" | "iso" | "hipaa" | "pci" | "state" | "federal" | "privacy" | "industry";

export interface RegulatoryChange {
  source: RegulatorySource;
  title: string;
  impactArea: string;
  severity: "low" | "medium" | "high";
}

export class RegulatoryIntelligenceNetwork {
  impact(change: RegulatoryChange): string {
    return `${change.source}:${change.impactArea}:${change.severity}`;
  }

  remediationPlan(change: RegulatoryChange): string[] {
    return ["Assess impacted controls", "Map requirements", "Generate remediation owner", `Review ${change.title}`];
  }
}
