import { BaseService } from "./BaseService";
import type { TenantContext, TenantRepository, TrustRequestRecord } from "@zig/data-access";

/**
 * Implements the request workflow named in the spec: Request Submitted -> Approval Workflow
 * -> Access Granted -> Document Released. Audit logging of each transition happens at the
 * server-action layer (apps/web/app/lib/actions.ts), per this repo's existing convention
 * (no service calls AuditService internally - see EvidenceService/RiskService).
 */
export class TrustRequestService extends BaseService<TrustRequestRecord> {
  constructor(trustRequestRepository: TenantRepository<TrustRequestRecord>) {
    super(trustRequestRepository);
  }

  findByProject(context: TenantContext, projectId: string): Promise<TrustRequestRecord[]> {
    return this.repository.findMany(context, { filters: { projectId } });
  }

  submitRequest(
    context: TenantContext,
    projectId: string,
    input: { documentId?: string; requesterName: string; requesterEmail: string; requesterCompany?: string; reason: string },
  ): Promise<TrustRequestRecord> {
    return this.repository.create(context, { id: crypto.randomUUID(), projectId, ...input, status: "pending" });
  }

  async decide(context: TenantContext, requestId: string, approve: boolean): Promise<TrustRequestRecord> {
    const userId = this.requireActorUserId(context);
    const updated = await this.repository.update(context, requestId, {
      status: approve ? "approved" : "denied",
      decidedByUserId: userId,
      decidedAt: new Date(),
    });
    if (!updated) {
      throw new Error(`Trust request ${requestId} not found.`);
    }
    return updated;
  }

  async fulfill(context: TenantContext, requestId: string): Promise<TrustRequestRecord> {
    const existing = await this.repository.findById(context, requestId);
    if (!existing) {
      throw new Error(`Trust request ${requestId} not found.`);
    }
    if (existing.status !== "approved") {
      throw new Error(`Trust request ${requestId} must be approved before the document can be released.`);
    }
    const updated = await this.repository.update(context, requestId, { status: "fulfilled" });
    if (!updated) {
      throw new Error(`Trust request ${requestId} not found.`);
    }
    return updated;
  }

  private requireActorUserId(context: TenantContext): string {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to decide a trust request.");
    }
    return context.actorUserId;
  }
}
