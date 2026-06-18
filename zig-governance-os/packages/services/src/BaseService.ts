import type { CreateRecord, TenantContext, TenantRepository, TenantScopedRecord, UpdateRecord } from "@zig/data-access";

export class BaseService<T extends TenantScopedRecord> {
  constructor(protected readonly repository: TenantRepository<T>) {}

  create(context: TenantContext, record: CreateRecord<T>): Promise<T> {
    return this.repository.create(context, record);
  }

  update(context: TenantContext, id: string, patch: UpdateRecord<T>): Promise<T | null> {
    return this.repository.update(context, id, patch);
  }

  delete(context: TenantContext, id: string): Promise<T | null> {
    return this.repository.delete(context, id);
  }

  findById(context: TenantContext, id: string): Promise<T | null> {
    return this.repository.findById(context, id);
  }

  findMany(context: TenantContext): Promise<T[]> {
    return this.repository.findMany(context);
  }

  search(context: TenantContext, term: string, fields: Array<Extract<keyof T, string>>): Promise<T[]> {
    return this.repository.search(context, { term, fields });
  }
}
