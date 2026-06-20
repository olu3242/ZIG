import { BaseService } from "./BaseService";
import type { TenantContext, TenantRepository, TrustDocumentRecord } from "@zig/data-access";

export class TrustDocumentService extends BaseService<TrustDocumentRecord> {
  constructor(trustDocumentRepository: TenantRepository<TrustDocumentRecord>) {
    super(trustDocumentRepository);
  }

  findByProject(context: TenantContext, projectId: string): Promise<TrustDocumentRecord[]> {
    return this.repository.findMany(context, { filters: { projectId } });
  }

  async findPublic(context: TenantContext, projectId: string): Promise<TrustDocumentRecord[]> {
    const documents = await this.findByProject(context, projectId);
    const now = new Date();
    return documents.filter((document) => document.visibility === "public" && (!document.expiresAt || document.expiresAt > now));
  }

  publish(
    context: TenantContext,
    projectId: string,
    input: { title: string; category: TrustDocumentRecord["category"]; visibility: TrustDocumentRecord["visibility"]; sourceUri: string; expiresAt?: Date },
  ): Promise<TrustDocumentRecord> {
    return this.repository.create(context, { id: crypto.randomUUID(), projectId, ...input });
  }
}
