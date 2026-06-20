import { computeFrameworkCoverage, computeFrameworkGaps, type FrameworkCoverageBreakdown, type FrameworkGap } from "./frameworkIntelligence";
import type {
  ControlEvidenceRecord,
  ControlRecord,
  EvidenceReviewRecord,
  FrameworkControlRecord,
  FrameworkRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";

export interface ComplianceCenterRow {
  framework: FrameworkRecord;
  coverage: FrameworkCoverageBreakdown;
  gaps: FrameworkGap[];
  roadmapStatus: "not_started" | "in_progress" | "ready";
}

/**
 * Composes the Compliance Center's "per framework" matrix (Coverage %, Implemented,
 * Missing, Evidence Coverage, Roadmap Status) entirely by calling computeFrameworkCoverage/
 * computeFrameworkGaps - the exact pure functions FrameworkCoverageService/FrameworkGapService
 * already call - across every framework in the catalogue, not by re-deriving coverage math.
 * Takes the same raw repositories those services take (no service-to-service injection).
 */
export class ComplianceStatusService {
  constructor(
    private readonly frameworkRepository: TenantRepository<FrameworkRecord>,
    private readonly frameworkControlRepository: TenantRepository<FrameworkControlRecord>,
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly controlEvidenceRepository: TenantRepository<ControlEvidenceRecord>,
    private readonly evidenceReviewRepository: TenantRepository<EvidenceReviewRecord>,
  ) {}

  async getComplianceCenter(context: TenantContext): Promise<ComplianceCenterRow[]> {
    const [frameworks, frameworkControls, controls, controlEvidenceLinks, evidenceReviews] = await Promise.all([
      this.frameworkRepository.findMany(context),
      this.frameworkControlRepository.findMany(context),
      this.controlRepository.findMany(context),
      this.controlEvidenceRepository.findMany(context),
      this.evidenceReviewRepository.findMany(context),
    ]);

    return frameworks.map((framework) => {
      const ownFrameworkControls = frameworkControls.filter((control) => control.frameworkId === framework.id);
      const ownControls = controls.filter((control) => control.frameworkId === framework.id);
      const coverage = computeFrameworkCoverage(ownFrameworkControls, ownControls, controlEvidenceLinks, evidenceReviews);
      const gaps = computeFrameworkGaps(coverage);

      const roadmapStatus: ComplianceCenterRow["roadmapStatus"] =
        coverage.totalControlCount === 0 || coverage.coveragePercent === 0
          ? "not_started"
          : coverage.coveragePercent >= 100
            ? "ready"
            : "in_progress";

      return { framework, coverage, gaps, roadmapStatus };
    });
  }
}
