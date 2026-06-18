export type GapType = "control" | "evidence" | "framework" | "policy" | "risk" | "audit";
export type ReadinessBand = "red" | "amber" | "green";

export interface GapAssessmentOutput {
  type: GapType;
  count: number;
  readinessScore: number;
  band: ReadinessBand;
}

export class GapAssessmentEngine {
  assess(type: GapType, expected: number, missing: number): GapAssessmentOutput {
    const readinessScore = expected === 0 ? 100 : Math.max(0, Math.round((expected - missing) / expected * 100));
    return { type, count: missing, readinessScore, band: readinessScore >= 75 ? "green" : readinessScore >= 50 ? "amber" : "red" };
  }
}
