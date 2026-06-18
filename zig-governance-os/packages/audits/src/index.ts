export type AuditLifecycle = "planned" | "active" | "fieldwork" | "review" | "remediation" | "closed";

export interface AuditReadinessInput {
  evidenceCoverage: number;
  controlEffectiveness: number;
  openFindings: number;
  remediationOverdue: number;
}

export class AuditManagementEngine {
  readiness(input: AuditReadinessInput): number {
    const penalty = input.openFindings * 3 + input.remediationOverdue * 7;
    return Math.max(0, Math.min(100, Math.round((input.evidenceCoverage + input.controlEffectiveness) / 2 - penalty)));
  }
}
