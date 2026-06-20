import { computeEvidenceReuse, type EvidenceReuseRow } from "./frameworkIntelligence";
import type { ControlEvidenceRecord, ControlRecord, FrameworkControlRecord, FrameworkMappingRecord, TenantContext, TenantRepository } from "@zig/data-access";

/**
 * Reuse metrics for already-uploaded evidence: how many other framework controls (across
 * any framework) the same evidence could satisfy via framework_mappings, without
 * re-collecting it. Reads control_evidence (already written by EvidenceService.linkToControl)
 * — no new evidence_framework_links table; the reusability is computed, not stored.
 */
export class EvidenceReuseService {
  constructor(
    private readonly controlEvidenceRepository: TenantRepository<ControlEvidenceRecord>,
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly frameworkControlRepository: TenantRepository<FrameworkControlRecord>,
    private readonly frameworkMappingRepository: TenantRepository<FrameworkMappingRecord>,
  ) {}

  async getReuse(context: TenantContext, projectId: string): Promise<EvidenceReuseRow[]> {
    const [projectControls, frameworkControls, mappings] = await Promise.all([
      this.controlRepository.findMany(context, { filters: { projectId } }),
      this.frameworkControlRepository.findMany(context),
      this.frameworkMappingRepository.findMany(context),
    ]);

    const controlIds = new Set(projectControls.map((control) => control.id));
    const controlEvidenceLinks = (await this.controlEvidenceRepository.findMany(context)).filter((link) => controlIds.has(link.controlId));

    return computeEvidenceReuse(controlEvidenceLinks, projectControls, frameworkControls, mappings);
  }
}
