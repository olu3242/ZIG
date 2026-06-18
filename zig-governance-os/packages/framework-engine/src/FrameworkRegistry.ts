import type { Framework } from "@zig/types";

export type FrameworkCode =
  | "ISO27001"
  | "NIST_CSF"
  | "SOC2"
  | "HIPAA"
  | "PCI_DSS"
  | "CIS_CONTROLS";

export type RegisteredFramework = Framework & {
  code: FrameworkCode;
};

export const FRAMEWORK_REGISTRY: Record<FrameworkCode, RegisteredFramework> = {
  ISO27001: {
    id: "framework_iso27001_2022",
    code: "ISO27001",
    name: "ISO 27001",
    version: "2022",
    description: "Information security management system controls for risk-led governance programs.",
  },
  NIST_CSF: {
    id: "framework_nist_csf_2",
    code: "NIST_CSF",
    name: "NIST Cybersecurity Framework",
    version: "2.0",
    description: "Cybersecurity outcomes organized around govern, identify, protect, detect, respond, and recover.",
  },
  SOC2: {
    id: "framework_soc2_2022",
    code: "SOC2",
    name: "SOC 2",
    version: "2022 Trust Services Criteria",
    description: "Trust Services Criteria for security, availability, processing integrity, confidentiality, and privacy.",
  },
  HIPAA: {
    id: "framework_hipaa_security_rule",
    code: "HIPAA",
    name: "HIPAA",
    version: "Security Rule",
    description: "Administrative, physical, and technical safeguards for protected health information.",
  },
  PCI_DSS: {
    id: "framework_pci_dss_4",
    code: "PCI_DSS",
    name: "PCI DSS",
    version: "4.0.1",
    description: "Payment card data security requirements for protecting cardholder environments.",
  },
  CIS_CONTROLS: {
    id: "framework_cis_controls_8",
    code: "CIS_CONTROLS",
    name: "CIS Controls",
    version: "8.1",
    description: "Prioritized safeguards for practical cyber defense and governance coverage.",
  },
};

export class FrameworkRegistry {
  static list(): RegisteredFramework[] {
    return Object.values(FRAMEWORK_REGISTRY);
  }

  static get(code: FrameworkCode): RegisteredFramework {
    return FRAMEWORK_REGISTRY[code];
  }

  static findById(id: string): RegisteredFramework | undefined {
    return FrameworkRegistry.list().find((framework) => framework.id === id);
  }
}
