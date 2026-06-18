import type { AuditAction, AuditSink, TenantContext } from "@zig/data-access";

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
}
