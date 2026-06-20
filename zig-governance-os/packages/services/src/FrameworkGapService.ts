import { computeFrameworkCoverage, computeFrameworkGaps, type FrameworkGap } from "./frameworkIntelligence";
import type {
  ControlEvidenceRecord,
  ControlRecord,
  EvidenceReviewRecord,
  FrameworkControlRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";

/**
 * Same fetch shape as FrameworkCoverageService (each service reads its own repositories
 * directly, per the established no-service-composition pattern in factory.ts) — derives
 * the coverage breakdown internally, then turns the non-implemented controls into an
 * explainable gap list with a remediation recommendation per gap.
 */
export class FrameworkGapService {
  constructor(
    private readonly frameworkControlRepository: TenantRepository<FrameworkControlRecord>,
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly controlEvidenceRepository: TenantRepository<ControlEvidenceRecord>,
    private readonly evidenceReviewRepository: TenantRepository<EvidenceReviewRecord>,
  ) {}

  async getGaps(context: TenantContext, projectId: string, frameworkId: string): Promise<FrameworkGap[]> {
    const [frameworkControls, projectControls, controlEvidenceLinks] = await Promise.all([
      this.frameworkControlRepository.findMany(context, { filters: { frameworkId } }),
      this.controlRepository.findMany(context, { filters: { projectId, frameworkId } }),
      this.controlEvidenceRepository.findMany(context),
    ]);

    const controlIds = new Set(projectControls.map((control) => control.id));
    const relevantLinks = controlEvidenceLinks.filter((link) => controlIds.has(link.controlId));
    const evidenceReviews = relevantLinks.length ? await this.evidenceReviewRepository.findMany(context) : [];

    const coverage = computeFrameworkCoverage(frameworkControls, projectControls, relevantLinks, evidenceReviews);
    return computeFrameworkGaps(coverage);
  }
}
