export interface ContinuousComplianceInput {
  frameworkReadiness: number;
  controlHealth: number;
  evidenceHealth: number;
  auditReadiness: number;
  certificationReadiness: number;
}

export interface ContinuousCompliancePosture extends ContinuousComplianceInput {
  complianceScore: number;
  band: "red" | "amber" | "green";
}

export class ContinuousComplianceEngine {
  calculate(input: ContinuousComplianceInput): ContinuousCompliancePosture {
    const complianceScore = clamp((input.frameworkReadiness + input.controlHealth + input.evidenceHealth + input.auditReadiness + input.certificationReadiness) / 5);
    return { ...input, complianceScore, band: complianceScore >= 75 ? "green" : complianceScore >= 50 ? "amber" : "red" };
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
