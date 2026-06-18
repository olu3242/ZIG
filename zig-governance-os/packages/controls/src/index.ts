export type ControlLifecycle = "draft" | "implemented" | "active" | "monitored" | "tested" | "exception" | "retired";
export type ControlScore = "not_implemented" | "partially_implemented" | "implemented" | "effective" | "optimized";

export interface ControlAssessmentInput {
  implementation: number;
  testPassRate: number;
  evidenceCoverage: number;
  maturity: number;
  hasOpenException: boolean;
}

export interface ControlAssessment {
  score: ControlScore;
  effectiveness: number;
  lifecycle: ControlLifecycle;
}

export class ControlManagementEngine {
  assess(input: ControlAssessmentInput): ControlAssessment {
    const effectiveness = Math.round((input.implementation + input.testPassRate + input.evidenceCoverage + input.maturity) / 4);
    const score: ControlScore =
      effectiveness >= 90 ? "optimized" :
      effectiveness >= 75 ? "effective" :
      effectiveness >= 50 ? "implemented" :
      effectiveness > 0 ? "partially_implemented" :
      "not_implemented";

    return {
      score,
      effectiveness,
      lifecycle: input.hasOpenException ? "exception" : effectiveness >= 75 ? "tested" : effectiveness >= 50 ? "active" : "implemented",
    };
  }
}
