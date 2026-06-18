import type {
  AuditEvent,
  AuditSink,
  CreateRecord,
  DatabaseAdapter,
  RepositoryQuery,
  SearchQuery,
  TenantContext,
  TenantScopedRecord,
  UpdateRecord,
} from "./types";

export interface SupabaseRestConfig {
  url: string;
  serviceRoleKey: string;
}

export class DataAccessError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DataAccessError";
  }
}

export class SupabaseRestAdapter<T extends TenantScopedRecord> implements DatabaseAdapter<T> {
  constructor(private readonly config: SupabaseRestConfig) {}

  async insert(tableName: string, record: T): Promise<T> {
    const rows = await this.request(tableName, {
      method: "POST",
      body: JSON.stringify(toSnakeRecord(record as unknown as Record<string, unknown>)),
      headers: { Prefer: "return=representation" },
    }, record.tenantId);

    return fromSnakeRecord(rows[0]) as T;
  }

  async update(tableName: string, context: TenantContext, id: string, patch: UpdateRecord<T>): Promise<T | null> {
    const rows = await this.request(this.withFilters(tableName, context, { id }), {
      method: "PATCH",
      body: JSON.stringify(toSnakeRecord(patch as unknown as Record<string, unknown>)),
      headers: { Prefer: "return=representation" },
    }, context.tenantId);

    return rows[0] ? (fromSnakeRecord(rows[0]) as T) : null;
  }

  async delete(tableName: string, context: TenantContext, id: string): Promise<T | null> {
    const rows = await this.request(this.withFilters(tableName, context, { id }), {
      method: "DELETE",
      headers: { Prefer: "return=representation" },
    }, context.tenantId);

    return rows[0] ? (fromSnakeRecord(rows[0]) as T) : null;
  }

  async findById(tableName: string, context: TenantContext, id: string): Promise<T | null> {
    const rows = await this.request(this.withFilters(tableName, context, { id }), { method: "GET" }, context.tenantId);
    return rows[0] ? (fromSnakeRecord(rows[0]) as T) : null;
  }

  async findMany(tableName: string, context: TenantContext, query?: RepositoryQuery<T>): Promise<T[]> {
    const rows = await this.request(this.withFilters(tableName, context, query?.filters, query), { method: "GET" }, context.tenantId);
    return rows.map((row) => fromSnakeRecord(row) as T);
  }

  async search(tableName: string, context: TenantContext, query: SearchQuery<T>): Promise<T[]> {
    const filters = { ...query.filters };
    const rows = await this.request(this.withFilters(tableName, context, filters, query), { method: "GET" }, context.tenantId);
    const term = query.term.toLowerCase();

    return rows
      .map((row) => fromSnakeRecord(row) as T)
      .filter((row) => query.fields.some((field) => String(row[field] ?? "").toLowerCase().includes(term)));
  }

  private async request(path: string, init: RequestInit, tenantId?: string): Promise<Array<Record<string, unknown>>> {
    const response = await fetch(`${this.config.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: this.config.serviceRoleKey,
        Authorization: `Bearer ${this.config.serviceRoleKey}`,
        "Content-Type": "application/json",
        ...(tenantId ? { "x-tenant-id": tenantId } : {}),
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new DataAccessError(`Supabase request failed for ${path}: ${response.status} ${await response.text()}`);
    }

    if (response.status === 204) {
      return [];
    }

    return (await response.json()) as Array<Record<string, unknown>>;
  }

  private withFilters(
    tableName: string,
    context: TenantContext,
    filters?: Partial<Record<string, unknown>>,
    query?: RepositoryQuery<T>,
  ): string {
    const params = new URLSearchParams();
    params.set("tenant_id", `eq.${context.tenantId}`);

    for (const [key, value] of Object.entries(filters ?? {})) {
      if (value !== undefined) {
        params.set(toSnakeKey(key), `eq.${String(value)}`);
      }
    }

    if (query?.limit) {
      params.set("limit", String(query.limit));
    }

    if (query?.offset) {
      params.set("offset", String(query.offset));
    }

    return `${tableName}?${params.toString()}`;
  }
}

export class SupabaseAuditSink implements AuditSink {
  private readonly adapter: SupabaseRestAdapter<AuditEvent>;

  constructor(config: SupabaseRestConfig) {
    this.adapter = new SupabaseRestAdapter<AuditEvent>(config);
  }

  async record(event: Omit<AuditEvent, "id" | "createdAt">): Promise<AuditEvent> {
    return this.adapter.insert("audit_events", {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }
}

export function toSnakeRecord(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [toSnakeKey(key), value instanceof Date ? value.toISOString() : value]),
  );
}

export function fromSnakeRecord(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [toCamelKey(key), value]));
}

function toSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}

function toCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
