import type { GovernanceScore } from "@zig/types";

export interface GovernanceScoreInputs {
  tenantId: string;
  projectId: string;
  controlsImplemented: number;
  evidenceCoverage: number;
  riskTreatment: number;
  assessmentCompletion: number;
}

export interface GovernanceScoreWeights {
  controlsImplemented: number;
  evidenceCoverage: number;
  riskTreatment: number;
  assessmentCompletion: number;
}

export const DEFAULT_GOVERNANCE_SCORE_WEIGHTS: GovernanceScoreWeights = {
  controlsImplemented: 0.35,
  evidenceCoverage: 0.25,
  riskTreatment: 0.25,
  assessmentCompletion: 0.15,
};

export class GovernanceScoreEngine {
  constructor(
    private readonly weights: GovernanceScoreWeights = DEFAULT_GOVERNANCE_SCORE_WEIGHTS,
  ) {}

  calculateScore(inputs: GovernanceScoreInputs): GovernanceScore {
    const score =
      this.normalize(inputs.controlsImplemented) * this.weights.controlsImplemented +
      this.normalize(inputs.evidenceCoverage) * this.weights.evidenceCoverage +
      this.normalize(inputs.riskTreatment) * this.weights.riskTreatment +
      this.normalize(inputs.assessmentCompletion) * this.weights.assessmentCompletion;

    const roundedScore = Math.round(score);

    return {
      tenantId: inputs.tenantId,
      projectId: inputs.projectId,
      score: roundedScore,
      controlsImplemented: this.normalize(inputs.controlsImplemented),
      evidenceCoverage: this.normalize(inputs.evidenceCoverage),
      riskTreatment: this.normalize(inputs.riskTreatment),
      assessmentCompletion: this.normalize(inputs.assessmentCompletion),
      explanation: this.explain(roundedScore, inputs),
      calculatedAt: new Date(),
    };
  }

  private normalize(value: number): number {
    return Math.min(100, Math.max(0, value));
  }

  private explain(score: number, inputs: GovernanceScoreInputs): string {
    const weakestInput = [
      ["controls implemented", inputs.controlsImplemented],
      ["evidence coverage", inputs.evidenceCoverage],
      ["risk treatment", inputs.riskTreatment],
      ["assessment completion", inputs.assessmentCompletion],
    ].sort((a, b) => Number(a[1]) - Number(b[1]))[0][0];

    return `Governance health is ${score}/100. The largest improvement lever is ${weakestInput}, based on the current weighted model.`;
  }
}
