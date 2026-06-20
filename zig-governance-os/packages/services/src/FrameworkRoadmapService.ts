import { computeFrameworkCoverage, computeRoadmap, type FrameworkRoadmap } from "./frameworkIntelligence";
import type {
  ControlEvidenceRecord,
  ControlRecord,
  EvidenceReviewRecord,
  FrameworkControlRecord,
  FrameworkMappingRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";

/**
 * Roadmap from a project's current framework to a target framework it does not yet hold:
 * derives the current framework's coverage (same shape as FrameworkCoverageService), then
 * walks framework_mappings to find which target-framework controls are already reachable
 * from already-implemented current-framework controls vs. which still need net-new work.
 * No new "framework_roadmaps" table — a roadmap is a view over existing data, not a fact
 * that needs to be persisted.
 */
export class FrameworkRoadmapService {
  constructor(
    private readonly frameworkControlRepository: TenantRepository<FrameworkControlRecord>,
    private readonly frameworkMappingRepository: TenantRepository<FrameworkMappingRecord>,
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly controlEvidenceRepository: TenantRepository<ControlEvidenceRecord>,
    private readonly evidenceReviewRepository: TenantRepository<EvidenceReviewRecord>,
  ) {}

  async getRoadmap(context: TenantContext, projectId: string, currentFrameworkId: string, targetFrameworkId: string): Promise<FrameworkRoadmap> {
    const [currentFrameworkControls, targetFrameworkControls, projectControls, controlEvidenceLinks, mappings] = await Promise.all([
      this.frameworkControlRepository.findMany(context, { filters: { frameworkId: currentFrameworkId } }),
      this.frameworkControlRepository.findMany(context, { filters: { frameworkId: targetFrameworkId } }),
      this.controlRepository.findMany(context, { filters: { projectId, frameworkId: currentFrameworkId } }),
      this.controlEvidenceRepository.findMany(context),
      this.frameworkMappingRepository.findMany(context),
    ]);

    const controlIds = new Set(projectControls.map((control) => control.id));
    const relevantLinks = controlEvidenceLinks.filter((link) => controlIds.has(link.controlId));
    const evidenceReviews = relevantLinks.length ? await this.evidenceReviewRepository.findMany(context) : [];

    const currentCoverage = computeFrameworkCoverage(currentFrameworkControls, projectControls, relevantLinks, evidenceReviews);
    return computeRoadmap(targetFrameworkControls, currentCoverage, mappings);
  }
}
