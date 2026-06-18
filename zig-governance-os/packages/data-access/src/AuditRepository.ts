import type { AuditEvent, AuditSink } from "./types";

export class AuditRepository implements AuditSink {
  private readonly events: AuditEvent[] = [];

  async record(event: Omit<AuditEvent, "id" | "createdAt">): Promise<AuditEvent> {
    const auditEvent: AuditEvent = {
      ...event,
      id: `audit_event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date(),
    };

    this.events.push(auditEvent);
    return auditEvent;
  }

  async findByTenant(tenantId: string): Promise<AuditEvent[]> {
    return this.events.filter((event) => event.tenantId === tenantId);
  }
}
