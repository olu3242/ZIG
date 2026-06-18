import { BaseService } from "./BaseService";
import type { TenantContext, TenantRecord, TenantRepository, UserRecord } from "@zig/data-access";

export interface CreateTenantInput {
  name: string;
  slug: string;
  ownerUserId?: string;
}

export class TenantService extends BaseService<TenantRecord> {
  constructor(
    tenantRepository: TenantRepository<TenantRecord>,
    private readonly userRepository: TenantRepository<UserRecord>,
  ) {
    super(tenantRepository);
  }

  async createOrganization(input: CreateTenantInput): Promise<TenantRecord> {
    const tenantId = crypto.randomUUID();
    const context: TenantContext = { tenantId, actorUserId: input.ownerUserId };
    const tenant = await this.repository.create(context, {
      id: tenantId,
      name: assertPresent(input.name, "Organization name"),
      slug: assertSlug(input.slug),
      status: "trial",
    });

    return tenant;
  }

  async findProfileTenant(context: TenantContext): Promise<TenantRecord | null> {
    return this.findById(context, context.tenantId);
  }

  async countUsers(context: TenantContext): Promise<number> {
    return (await this.userRepository.findMany(context)).length;
  }
}

function assertPresent(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }
  return trimmed;
}

function assertSlug(value: string): string {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) {
    throw new Error("Organization slug is required.");
  }
  return slug;
}
