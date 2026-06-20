import type { AuditAction, AuditEvent, AuditSink, TenantContext } from "@zig/data-access";

export class AuditService {
  constructor(private readonly auditSink: AuditSink) {}

  recordAction(context: TenantContext, action: AuditAction, entityTable: string, entityId: string, reason?: string) {
    return this.auditSink.record({
      tenantId: context.tenantId,
      actorUserId: context.actorUserId,
      action,
      entityTable,
      entityId,
      reason,
    });
  }

  async findRecentActivity(context: TenantContext, limit = 10): Promise<AuditEvent[]> {
    const events = await this.auditSink.findByTenant(context.tenantId);
    return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }
}
