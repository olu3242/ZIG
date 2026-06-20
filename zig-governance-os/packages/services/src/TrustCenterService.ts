import { BaseService } from "./BaseService";
import type { TenantContext, TenantRepository, TrustCenterProfileRecord } from "@zig/data-access";

/**
 * Manages the one new Trust Center fact that is genuinely a record, not a derived view: an
 * org's published trust profile (slug, name, publish state). Coverage/governance/vendor
 * health data shown on the public portal is composed at the page layer from the existing
 * FrameworkCoverageService/GovernanceService/RiskService outputs (see
 * apps/web/app/lib/data.ts loadTrustDashboard), never duplicated here.
 */
export class TrustCenterService extends BaseService<TrustCenterProfileRecord> {
  constructor(trustCenterProfileRepository: TenantRepository<TrustCenterProfileRecord>) {
    super(trustCenterProfileRepository);
  }

  findByProject(context: TenantContext, projectId: string): Promise<TrustCenterProfileRecord | null> {
    return this.repository.findMany(context, { filters: { projectId } }).then((rows) => rows[0] ?? null);
  }

  async upsertProfile(
    context: TenantContext,
    projectId: string,
    input: { slug: string; organizationName: string; tagline?: string; supportEmail?: string },
  ): Promise<TrustCenterProfileRecord> {
    const existing = await this.findByProject(context, projectId);
    if (existing) {
      const updated = await this.repository.update(context, existing.id, input);
      if (!updated) {
        throw new Error(`Trust profile ${existing.id} could not be updated.`);
      }
      return updated;
    }

    return this.repository.create(context, {
      id: crypto.randomUUID(),
      projectId,
      slug: input.slug,
      organizationName: input.organizationName,
      tagline: input.tagline,
      supportEmail: input.supportEmail,
      isPublished: false,
    });
  }

  async setPublished(context: TenantContext, profileId: string, isPublished: boolean): Promise<TrustCenterProfileRecord> {
    const updated = await this.repository.update(context, profileId, { isPublished });
    if (!updated) {
      throw new Error(`Trust profile ${profileId} not found.`);
    }
    return updated;
  }
}
