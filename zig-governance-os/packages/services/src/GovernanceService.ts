import { BaseService } from "./BaseService";
import type {
  ControlRecord,
  EvidenceRecord,
  EvidenceReviewRecord,
  GovernanceScoreRecord,
  ProjectFrameworkRecord,
  RecommendationRecord,
  RiskAssessmentRecord,
  RiskRecord,
  TenantContext,
  TenantRepository,
  VendorAssessmentRecord,
  VendorRecord,
} from "@zig/data-access";
import type { RecommendationSeverity } from "@zig/types";

export interface GovernanceScoreBreakdown {
  score: number;
  healthState: "Foundation" | "Visibility" | "Control" | "Managed" | "Optimized";
  explanation: string;
  controlCoverage: number;
  riskAssessmentCoverage: number;
  evidenceCompleteness: number;
  frameworkCoverage: number;
  ownershipCompleteness: number;
  reviewCompletion: number;
  vendorAssessmentCoverage: number;
}

// Implements docs/architecture/governance-scoring-engine.md Sections 1-4 exactly - no
// hardcoded score. Six real inputs, weighted, recomputed from live data on every read.
export class GovernanceService extends BaseService<GovernanceScoreRecord> {
  constructor(
    governanceScoreRepository: TenantRepository<GovernanceScoreRecord>,
    private readonly recommendationRepository: TenantRepository<RecommendationRecord>,
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly riskRepository: TenantRepository<RiskRecord>,
    private readonly riskAssessmentRepository: TenantRepository<RiskAssessmentRecord>,
    private readonly evidenceRepository: TenantRepository<EvidenceRecord>,
    private readonly evidenceReviewRepository: TenantRepository<EvidenceReviewRecord>,
    private readonly projectFrameworkRepository: TenantRepository<ProjectFrameworkRecord>,
    private readonly vendorRepository: TenantRepository<VendorRecord>,
    private readonly vendorAssessmentRepository: TenantRepository<VendorAssessmentRecord>,
  ) {
    super(governanceScoreRepository);
  }

  findRecommendations(context: TenantContext, projectId: string): Promise<RecommendationRecord[]> {
    return this.recommendationRepository.findMany(context, { filters: { projectId } });
  }

  // docs/architecture/health-advisor-engine.md Sections 2-3: one recommendation per input
  // strictly below 100%, persisted (not just computed), sorted by severity.
  async runHealthAdvisor(context: TenantContext, projectId: string): Promise<RecommendationRecord[]> {
    const breakdown = await this.calculateScore(context, projectId);

    const gaps = (Object.keys(RECOMMENDATION_RULES) as Array<keyof typeof RECOMMENDATION_RULES>).filter(
      (input) => breakdown[input] < 100,
    );

    const created = await Promise.all(
      gaps.map((input) => {
        const value = breakdown[input];
        const rule = RECOMMENDATION_RULES[input];
        return this.recommendationRepository.create(context, {
          id: crypto.randomUUID(),
          projectId,
          severity: rule.severity(value),
          title: `${labelFor(input)} is ${value}%`,
          explanation: `${labelFor(input)} is at ${value}%, below the 100% target for this input.`,
          action: rule.action,
          confidence: 1,
          frameworkReference: rule.frameworkReference,
        });
      }),
    );

    return created.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  }

  // docs/architecture/health-advisor-engine.md Section 5: persists the live score as a
  // queryable history row instead of only the current, recomputed-on-read value.
  async recordScoreSnapshot(context: TenantContext, projectId: string): Promise<GovernanceScoreRecord> {
    const breakdown = await this.calculateScore(context, projectId);

    return this.repository.create(context, {
      id: crypto.randomUUID(),
      projectId,
      score: breakdown.score,
      healthState: breakdown.healthState,
      controlCoverage: breakdown.controlCoverage,
      riskAssessmentCoverage: breakdown.riskAssessmentCoverage,
      evidenceCompleteness: breakdown.evidenceCompleteness,
      frameworkCoverage: breakdown.frameworkCoverage,
      ownershipCompleteness: breakdown.ownershipCompleteness,
      reviewCompletion: breakdown.reviewCompletion,
      vendorAssessmentCoverage: breakdown.vendorAssessmentCoverage,
      explanation: breakdown.explanation,
      calculatedAt: new Date(),
    });
  }

  async getScoreHistory(context: TenantContext, projectId: string): Promise<GovernanceScoreRecord[]> {
    const snapshots = await this.repository.findMany(context, { filters: { projectId } });
    return snapshots.sort((a, b) => a.calculatedAt.getTime() - b.calculatedAt.getTime());
  }

  async calculateScore(context: TenantContext, projectId: string): Promise<GovernanceScoreBreakdown> {
    const [controls, risks, riskAssessments, evidenceRows, evidenceReviews, projectFrameworks, vendors, vendorAssessments] = await Promise.all([
      this.controlRepository.findMany(context, { filters: { projectId } }),
      this.riskRepository.findMany(context, { filters: { projectId } }),
      this.riskAssessmentRepository.findMany(context, { filters: { projectId } }),
      this.evidenceRepository.findMany(context, { filters: { projectId } }),
      this.evidenceReviewRepository.findMany(context),
      this.projectFrameworkRepository.findMany(context, { filters: { projectId } }),
      this.vendorRepository.findMany(context, { filters: { projectId } }),
      this.vendorAssessmentRepository.findMany(context),
    ]);

    const evidenceIds = new Set(evidenceRows.map((evidence) => evidence.id));
    const projectEvidenceReviews = evidenceReviews.filter((review) => evidenceIds.has(review.evidenceId));
    const assignedFrameworkIds = new Set(projectFrameworks.map((pf) => pf.frameworkId));
    const riskIdsWithAssessment = new Set(riskAssessments.map((assessment) => assessment.riskId));
    const vendorIds = new Set(vendors.map((vendor) => vendor.id));
    const vendorIdsWithCompletedAssessment = new Set(
      vendorAssessments.filter((assessment) => assessment.status === "completed" && vendorIds.has(assessment.vendorId)).map((assessment) => assessment.vendorId),
    );

    const controlCoverage = percentage(controls.filter((control) => control.status === "implemented").length, controls.length);
    const riskAssessmentCoverage = percentage(risks.filter((risk) => riskIdsWithAssessment.has(risk.id)).length, risks.length);
    const evidenceCompleteness = percentage(
      evidenceRows.filter((evidence) =>
        projectEvidenceReviews.some((review) => review.evidenceId === evidence.id && review.status === "approved"),
      ).length,
      evidenceRows.length,
    );
    const frameworkCoverage = percentage(controls.filter((control) => assignedFrameworkIds.has(control.frameworkId)).length, controls.length);
    const ownershipCompleteness = percentage(controls.filter((control) => Boolean(control.ownerId)).length, controls.length);
    const reviewCompletion = percentage(projectEvidenceReviews.filter((review) => review.status !== "pending_review").length, projectEvidenceReviews.length);
    const vendorAssessmentCoverage = percentage(vendors.filter((vendor) => vendorIdsWithCompletedAssessment.has(vendor.id)).length, vendors.length);

    const inputs = {
      controlCoverage,
      riskAssessmentCoverage,
      evidenceCompleteness,
      frameworkCoverage,
      ownershipCompleteness,
      reviewCompletion,
      vendorAssessmentCoverage,
    };

    const score = Math.round(
      0.2 * inputs.controlCoverage +
        0.15 * inputs.riskAssessmentCoverage +
        0.2 * inputs.evidenceCompleteness +
        0.15 * inputs.frameworkCoverage +
        0.1 * inputs.ownershipCompleteness +
        0.1 * inputs.reviewCompletion +
        0.1 * inputs.vendorAssessmentCoverage,
    );

    const [lowestLabel, lowestValue] = (Object.entries(inputs) as Array<[keyof typeof inputs, number]>).reduce(
      (lowest, entry) => (entry[1] < lowest[1] ? entry : lowest),
    );

    return {
      score,
      healthState: healthStateFor(score),
      explanation: `${labelFor(lowestLabel)} (${lowestValue}%) is the lowest input — improve it to raise this score.`,
      ...inputs,
    };
  }
}

function percentage(numerator: number, denominator: number): number {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

function healthStateFor(score: number): GovernanceScoreBreakdown["healthState"] {
  if (score >= 90) return "Optimized";
  if (score >= 75) return "Managed";
  if (score >= 50) return "Control";
  if (score >= 25) return "Visibility";
  return "Foundation";
}

type ScoreInput = keyof Omit<GovernanceScoreBreakdown, "score" | "healthState" | "explanation">;

const SEVERITY_RANK: Record<RecommendationSeverity, number> = { critical: 0, high: 1, medium: 2, info: 3 };

// docs/architecture/health-advisor-engine.md Section 3 mapping table.
const RECOMMENDATION_RULES: Record<ScoreInput, { severity: (value: number) => RecommendationSeverity; action: string; frameworkReference: string }> = {
  controlCoverage: {
    severity: (value) => (value === 0 ? "critical" : value < 50 ? "high" : "medium"),
    action: "Implement the remaining unimplemented controls.",
    frameworkReference: "ISO 27001 Annex A",
  },
  riskAssessmentCoverage: {
    severity: (value) => (value === 0 ? "critical" : value < 50 ? "high" : "medium"),
    action: "Run a risk assessment for every identified risk.",
    frameworkReference: "NIST CSF ID.RA",
  },
  evidenceCompleteness: {
    severity: (value) => (value === 0 ? "critical" : value < 50 ? "high" : "medium"),
    action: "Submit and get approval on outstanding evidence.",
    frameworkReference: "SOC 2 CC7",
  },
  frameworkCoverage: {
    severity: () => "medium",
    action: "Map remaining controls to the project's assigned framework.",
    frameworkReference: "Project's assigned framework",
  },
  ownershipCompleteness: {
    severity: () => "medium",
    action: "Assign an owner to every control.",
    frameworkReference: "ISO 27001 A.5.2",
  },
  reviewCompletion: {
    severity: () => "medium",
    action: "Resolve pending evidence reviews (approve or reject).",
    frameworkReference: "SOC 2 CC7",
  },
  vendorAssessmentCoverage: {
    severity: (value) => (value < 50 ? "high" : "medium"),
    action: "Complete a risk assessment for every active vendor.",
    frameworkReference: "NIST CSF ID.SC",
  },
};

function labelFor(key: keyof Omit<GovernanceScoreBreakdown, "score" | "healthState" | "explanation">): string {
  const labels: Record<string, string> = {
    controlCoverage: "Control coverage",
    riskAssessmentCoverage: "Risk assessment coverage",
    evidenceCompleteness: "Evidence completeness",
    frameworkCoverage: "Framework coverage",
    ownershipCompleteness: "Ownership completeness",
    reviewCompletion: "Review completion",
    vendorAssessmentCoverage: "Vendor assessment coverage",
  };
  return labels[key];
}
