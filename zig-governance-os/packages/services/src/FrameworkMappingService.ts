import { computeCrosswalk, type CrosswalkRow } from "./frameworkIntelligence";
import type { FrameworkControlRecord, FrameworkMappingRecord, TenantContext, TenantRepository } from "@zig/data-access";

/**
 * Real cross-framework crosswalk lookups over the already-existing framework_controls/
 * framework_mappings tables (RLS + triggers already applied; only the service layer was
 * missing). No new mapping table — this reads the same rows
 * FrameworkRoadmapService/EvidenceReuseService also read, just from a different entry
 * point (one source control, every target control it maps to).
 */
export class FrameworkMappingService {
  constructor(
    private readonly frameworkMappingRepository: TenantRepository<FrameworkMappingRecord>,
    private readonly frameworkControlRepository: TenantRepository<FrameworkControlRecord>,
  ) {}

  async getCrosswalk(context: TenantContext, sourceFrameworkControlId: string): Promise<CrosswalkRow[]> {
    const mappings = await this.frameworkMappingRepository.findMany(context, { filters: { sourceFrameworkControlId } });
    const targetFrameworkControls = await this.frameworkControlRepository.findMany(context);
    return computeCrosswalk(sourceFrameworkControlId, mappings, targetFrameworkControls);
  }
}
