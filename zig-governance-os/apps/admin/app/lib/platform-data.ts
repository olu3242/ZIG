import { validateAuthEnvironment } from "@zig/auth";

interface SupabaseAdminConfig {
  url: string;
  serviceRoleKey: string;
}

export interface PlatformTenant {
  id: string;
  slug: string;
  name: string;
  status: string;
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  tenantId: string;
  email: string;
  role: string;
  persona: string;
  status: string;
}

export interface PlatformAuditEvent {
  id: string;
  tenantId: string;
  actorUserId?: string;
  action: string;
  entityTable: string;
  entityId: string;
  reason?: string;
  createdAt: string;
}

export async function loadPlatformTenants(): Promise<PlatformTenant[]> {
  return requestRows<PlatformTenant>("tenants", "id,slug,name,status,created_at", "created_at.desc");
}

export async function loadPlatformUsers(): Promise<PlatformUser[]> {
  return requestRows<PlatformUser>("users", "id,tenant_id,email,role,persona,status", "created_at.desc");
}

export async function loadPlatformAuditEvents(): Promise<PlatformAuditEvent[]> {
  return requestRows<PlatformAuditEvent>("audit_events", "id,tenant_id,actor_user_id,action,entity_table,entity_id,reason,created_at", "created_at.desc", 50);
}

export async function loadPlatformRuntime() {
  const [tenants, users, auditEvents] = await Promise.all([
    loadPlatformTenants(),
    loadPlatformUsers(),
    loadPlatformAuditEvents(),
  ]);

  return {
    tenantCount: tenants.length,
    userCount: users.length,
    auditEventCount: auditEvents.length,
    activeTenantCount: tenants.filter((tenant) => tenant.status === "active" || tenant.status === "trial").length,
  };
}

async function requestRows<T>(table: string, select: string, order: string, limit = 100): Promise<T[]> {
  const config = getConfig();
  const params = new URLSearchParams({ select, order, limit: String(limit) });
  const response = await fetch(`${config.url}/rest/v1/${table}?${params.toString()}`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return ((await response.json()) as Array<Record<string, unknown>>).map(fromSnakeRecord) as T[];
}

function getConfig(): SupabaseAdminConfig {
  const { url, serviceRoleKey } = validateAuthEnvironment();
  return { url, serviceRoleKey };
}

function fromSnakeRecord(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [toCamelKey(key), value]));
}

function toCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
