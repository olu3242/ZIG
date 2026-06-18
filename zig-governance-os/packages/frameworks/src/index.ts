export type FrameworkCode =
  | "iso27001_2022"
  | "nist_csf_2"
  | "nist_800_53_rev5"
  | "soc2"
  | "hipaa"
  | "pci_dss"
  | "cis_controls_v8"
  | "gdpr"
  | "cmmc"
  | "custom";

export interface FrameworkDefinition {
  code: FrameworkCode;
  name: string;
  version: string;
  domains: string[];
  controlCount: number;
}

export interface FrameworkReadiness {
  frameworkCode: FrameworkCode;
  coverage: number;
  readiness: number;
  health: "red" | "amber" | "green";
  controlCoverage: number;
  evidenceCoverage: number;
  gapCount: number;
}

export const frameworkRegistry: FrameworkDefinition[] = [
  framework("iso27001_2022", "ISO 27001", "2022", ["Context", "Leadership", "Planning", "Support", "Operation", "Performance", "Improvement", "Annex A"], 93),
  framework("nist_csf_2", "NIST CSF", "2.0", ["Govern", "Identify", "Protect", "Detect", "Respond", "Recover"], 106),
  framework("nist_800_53_rev5", "NIST 800-53", "Rev 5", ["Access Control", "Audit", "Risk Assessment", "System Protection"], 320),
  framework("soc2", "SOC 2", "Trust Services Criteria", ["Security", "Availability", "Confidentiality", "Processing Integrity", "Privacy"], 64),
  framework("hipaa", "HIPAA", "Security Rule", ["Administrative", "Physical", "Technical"], 42),
  framework("pci_dss", "PCI DSS", "4.0", ["Network Security", "Account Data", "Vulnerability", "Access Control", "Monitoring", "Policy"], 64),
  framework("cis_controls_v8", "CIS Controls", "v8", ["Basic", "Foundational", "Organizational"], 153),
  framework("gdpr", "GDPR", "2016/679", ["Principles", "Rights", "Controller", "Processor", "Transfers", "Supervision"], 99),
  framework("cmmc", "CMMC", "2.0", ["Access Control", "Awareness", "Audit", "Configuration", "Identification", "Incident Response"], 110),
  framework("custom", "Custom Frameworks", "tenant-defined", ["Custom Domains"], 0),
];

export class FrameworkIntelligenceEngine {
  listFrameworks(): FrameworkDefinition[] {
    return frameworkRegistry;
  }

  score(input: Omit<FrameworkReadiness, "health">): FrameworkReadiness {
    const readiness = clamp(input.readiness);
    return {
      ...input,
      coverage: clamp(input.coverage),
      readiness,
      controlCoverage: clamp(input.controlCoverage),
      evidenceCoverage: clamp(input.evidenceCoverage),
      health: readiness >= 75 ? "green" : readiness >= 50 ? "amber" : "red",
    };
  }
}

function framework(code: FrameworkCode, name: string, version: string, domains: string[], controlCount: number): FrameworkDefinition {
  return { code, name, version, domains, controlCount };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
