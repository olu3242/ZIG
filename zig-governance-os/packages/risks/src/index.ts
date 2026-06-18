export type TreatmentStrategy = "mitigate" | "transfer" | "accept" | "avoid";
export type RiskBand = "critical" | "high" | "medium" | "low" | "informational";

export interface RiskScoreInput {
  likelihood: number;
  impact: number;
  controlEffectiveness: number;
  treatmentEffectiveness: number;
}

export interface RiskScore {
  inherentRisk: number;
  residualRisk: number;
  band: RiskBand;
}

export class RiskManagementEngine {
  score(input: RiskScoreInput): RiskScore {
    const inherentRisk = clamp((input.likelihood * input.impact) / 25 * 100);
    const reduction = (clamp(input.controlEffectiveness) + clamp(input.treatmentEffectiveness)) / 2;
    const residualRisk = clamp(inherentRisk * (1 - reduction / 100));
    return { inherentRisk, residualRisk, band: band(residualRisk) };
  }
}

function band(score: number): RiskBand {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  if (score >= 15) return "low";
  return "informational";
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
