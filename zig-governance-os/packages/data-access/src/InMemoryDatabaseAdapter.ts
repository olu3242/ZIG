import type { DatabaseAdapter, RepositoryQuery, SearchQuery, TenantContext, TenantScopedRecord, UpdateRecord } from "./types";

export class InMemoryDatabaseAdapter<T extends TenantScopedRecord> implements DatabaseAdapter<T> {
  private readonly tables = new Map<string, T[]>();

  constructor(seed: Record<string, T[]> = {}) {
    Object.entries(seed).forEach(([tableName, records]) => {
      this.tables.set(tableName, [...records]);
    });
  }

  async insert(tableName: string, record: T): Promise<T> {
    const records = this.table(tableName);
    records.push(record);
    return record;
  }

  async update(tableName: string, context: TenantContext, id: string, patch: UpdateRecord<T>): Promise<T | null> {
    const records = this.table(tableName);
    const index = records.findIndex((record) => record.id === id && record.tenantId === context.tenantId);

    if (index < 0) {
      return null;
    }

    const updated = {
      ...records[index],
      ...patch,
      tenantId: context.tenantId,
      updatedAt: new Date(),
    } as T;

    records[index] = updated;
    return updated;
  }

  async delete(tableName: string, context: TenantContext, id: string): Promise<T | null> {
    const records = this.table(tableName);
    const index = records.findIndex((record) => record.id === id && record.tenantId === context.tenantId);

    if (index < 0) {
      return null;
    }

    const [deleted] = records.splice(index, 1);
    return deleted;
  }

  async findById(tableName: string, context: TenantContext, id: string): Promise<T | null> {
    return this.table(tableName).find((record) => record.id === id && record.tenantId === context.tenantId) ?? null;
  }

  async findMany(tableName: string, context: TenantContext, query: RepositoryQuery<T> = {}): Promise<T[]> {
    const offset = query.offset ?? 0;
    const limit = query.limit ?? Number.POSITIVE_INFINITY;

    return this.table(tableName)
      .filter((record) => record.tenantId === context.tenantId)
      .filter((record) => this.matchesFilters(record, query.filters))
      .slice(offset, offset + limit);
  }

  async search(tableName: string, context: TenantContext, query: SearchQuery<T>): Promise<T[]> {
    const term = query.term.toLowerCase();
    const records = await this.findMany(tableName, context, query);

    return records.filter((record) =>
      query.fields.some((field) => {
        const value = record[field];
        return typeof value === "string" && value.toLowerCase().includes(term);
      }),
    );
  }

  private table(tableName: string): T[] {
    const existing = this.tables.get(tableName);

    if (existing) {
      return existing;
    }

    const next: T[] = [];
    this.tables.set(tableName, next);
    return next;
  }

  private matchesFilters(record: T, filters: RepositoryQuery<T>["filters"]): boolean {
    if (!filters) {
      return true;
    }

    return Object.entries(filters).every(([key, value]) => record[key as keyof T] === value);
  }
}
