export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "assign"
  | "complete"
  | "generate"
  | "certify"
  | "login"
  | "logout"
  | "review"
  | "certification";

export interface TenantContext {
  tenantId: string;
  actorUserId?: string;
}

export interface TenantScopedRecord {
  id: string;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateRecord<T extends TenantScopedRecord> = Omit<T, "tenantId" | "createdAt" | "updatedAt"> &
  Partial<Pick<T, "createdAt" | "updatedAt">>;

export type UpdateRecord<T extends TenantScopedRecord> = Partial<Omit<T, "id" | "tenantId" | "createdAt" | "updatedAt">>;

export interface RepositoryQuery<T extends TenantScopedRecord> {
  filters?: Partial<Omit<T, "tenantId">>;
  limit?: number;
  offset?: number;
}

export interface SearchQuery<T extends TenantScopedRecord> extends RepositoryQuery<T> {
  term: string;
  fields: Array<Extract<keyof T, string>>;
}

export interface AuditEvent extends TenantScopedRecord {
  actorUserId?: string;
  action: AuditAction;
  entityTable: string;
  entityId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  reason?: string;
  createdAt: Date;
}

export interface DatabaseAdapter<T extends TenantScopedRecord> {
  insert(tableName: string, record: T): Promise<T>;
  update(tableName: string, context: TenantContext, id: string, patch: UpdateRecord<T>): Promise<T | null>;
  delete(tableName: string, context: TenantContext, id: string): Promise<T | null>;
  findById(tableName: string, context: TenantContext, id: string): Promise<T | null>;
  findMany(tableName: string, context: TenantContext, query?: RepositoryQuery<T>): Promise<T[]>;
  search(tableName: string, context: TenantContext, query: SearchQuery<T>): Promise<T[]>;
}

export interface AuditSink {
  record(event: Omit<AuditEvent, "id" | "createdAt">): Promise<AuditEvent>;
}
