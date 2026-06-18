import type {
  AuditAction,
  AuditSink,
  CreateRecord,
  DatabaseAdapter,
  RepositoryQuery,
  SearchQuery,
  TenantContext,
  TenantScopedRecord,
  UpdateRecord,
} from "./types";

export class TenantRepository<T extends TenantScopedRecord> {
  constructor(
    private readonly tableName: string,
    private readonly adapter: DatabaseAdapter<T>,
    private readonly auditSink?: AuditSink,
  ) {}

  async create(context: TenantContext, record: CreateRecord<T>): Promise<T> {
    const now = new Date();
    const created = {
      ...record,
      tenantId: context.tenantId,
      createdAt: record.createdAt ?? now,
      updatedAt: record.updatedAt ?? now,
    } as T;

    const result = await this.adapter.insert(this.tableName, created);
    await this.audit(context, "create", undefined, result);
    return result;
  }

  async update(context: TenantContext, id: string, patch: UpdateRecord<T>): Promise<T | null> {
    const before = await this.findById(context, id);
    const result = await this.adapter.update(this.tableName, context, id, patch);

    if (result) {
      await this.audit(context, "update", before ?? undefined, result);
    }

    return result;
  }

  async delete(context: TenantContext, id: string): Promise<T | null> {
    const result = await this.adapter.delete(this.tableName, context, id);

    if (result) {
      await this.audit(context, "delete", result, undefined);
    }

    return result;
  }

  async findById(context: TenantContext, id: string): Promise<T | null> {
    return this.adapter.findById(this.tableName, context, id);
  }

  async findMany(context: TenantContext, query?: RepositoryQuery<T>): Promise<T[]> {
    return this.adapter.findMany(this.tableName, context, query);
  }

  async search(context: TenantContext, query: SearchQuery<T>): Promise<T[]> {
    return this.adapter.search(this.tableName, context, query);
  }

  async approve(context: TenantContext, id: string, patch: UpdateRecord<T> = {}): Promise<T | null> {
    const before = await this.findById(context, id);
    const result = await this.adapter.update(this.tableName, context, id, patch);

    if (result) {
      await this.audit(context, "approve", before ?? undefined, result);
    }

    return result;
  }

  async review(context: TenantContext, id: string, patch: UpdateRecord<T> = {}): Promise<T | null> {
    const before = await this.findById(context, id);
    const result = await this.adapter.update(this.tableName, context, id, patch);

    if (result) {
      await this.audit(context, "review", before ?? undefined, result);
    }

    return result;
  }

  async reject(context: TenantContext, id: string, patch: UpdateRecord<T> = {}): Promise<T | null> {
    return this.mutateWithAudit(context, id, patch, "reject");
  }

  async assign(context: TenantContext, id: string, patch: UpdateRecord<T> = {}): Promise<T | null> {
    return this.mutateWithAudit(context, id, patch, "assign");
  }

  async complete(context: TenantContext, id: string, patch: UpdateRecord<T> = {}): Promise<T | null> {
    return this.mutateWithAudit(context, id, patch, "complete");
  }

  async generate(context: TenantContext, id: string, patch: UpdateRecord<T> = {}): Promise<T | null> {
    return this.mutateWithAudit(context, id, patch, "generate");
  }

  async certify(context: TenantContext, id: string, patch: UpdateRecord<T> = {}): Promise<T | null> {
    return this.mutateWithAudit(context, id, patch, "certify");
  }

  private async mutateWithAudit(
    context: TenantContext,
    id: string,
    patch: UpdateRecord<T>,
    action: AuditAction,
  ): Promise<T | null> {
    const before = await this.findById(context, id);
    const result = await this.adapter.update(this.tableName, context, id, patch);

    if (result) {
      await this.audit(context, action, before ?? undefined, result);
    }

    return result;
  }

  private async audit(context: TenantContext, action: AuditAction, before?: T, after?: T): Promise<void> {
    if (!this.auditSink) {
      return;
    }

    await this.auditSink.record({
      tenantId: context.tenantId,
      actorUserId: context.actorUserId,
      action,
      entityTable: this.tableName,
      entityId: after?.id ?? before?.id ?? "",
      beforeState: before ? this.toAuditState(before) : undefined,
      afterState: after ? this.toAuditState(after) : undefined,
    });
  }

  private toAuditState(record: T): Record<string, unknown> {
    return Object.fromEntries(Object.entries(record));
  }
}
