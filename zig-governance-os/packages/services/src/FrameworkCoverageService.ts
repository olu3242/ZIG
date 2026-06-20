import { computeFrameworkCoverage, type FrameworkCoverageBreakdown } from "./frameworkIntelligence";
import type {
  ControlEvidenceRecord,
  ControlRecord,
  EvidenceReviewRecord,
  FrameworkControlRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";

/**
 * Real, compute-at-read-time framework coverage over the existing framework_controls
 * catalogue and a project's own controls/control_evidence/evidence_reviews — no new
 * "framework_coverage" table. Matches GovernanceService.calculateScore's existing coarse
 * frameworkCoverage input (% of controls assigned to the project's framework) with a
 * per-control breakdown that input does not provide.
 */
export class FrameworkCoverageService {
  constructor(
    private readonly frameworkControlRepository: TenantRepository<FrameworkControlRecord>,
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly controlEvidenceRepository: TenantRepository<ControlEvidenceRecord>,
    private readonly evidenceReviewRepository: TenantRepository<EvidenceReviewRecord>,
  ) {}

  async getCoverage(context: TenantContext, projectId: string, frameworkId: string): Promise<FrameworkCoverageBreakdown> {
    const [frameworkControls, projectControls, controlEvidenceLinks] = await Promise.all([
      this.frameworkControlRepository.findMany(context, { filters: { frameworkId } }),
      this.controlRepository.findMany(context, { filters: { projectId, frameworkId } }),
      this.controlEvidenceRepository.findMany(context),
    ]);

    const controlIds = new Set(projectControls.map((control) => control.id));
    const relevantLinks = controlEvidenceLinks.filter((link) => controlIds.has(link.controlId));

    const evidenceReviews = relevantLinks.length
      ? await this.evidenceReviewRepository.findMany(context)
      : [];

    return computeFrameworkCoverage(frameworkControls, projectControls, relevantLinks, evidenceReviews);
  }
}
