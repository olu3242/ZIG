export type AuthRepairEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "PROFILE_CREATED"
  | "ORG_CREATED"
  | "MEMBERSHIP_CREATED"
  | "ROLE_ASSIGNED"
  | "SESSION_RECOVERED"
  | "LEARNING_PROFILE_READY";

export interface AuthRepairClientConfig {
  url: string;
  serviceRoleKey: string;
}

export interface AuthRepairResult<T = unknown> {
  ok: boolean;
  action: "created" | "updated" | "exists" | "degraded" | "skipped";
  object: string;
  data?: T;
  error?: string;
}

export class AuthRepairClient {
  constructor(private readonly config: AuthRepairClientConfig) {}

  async getOne<T>(table: string, query: Record<string, string>): Promise<AuthRepairResult<T>> {
    const params = new URLSearchParams({ select: "*", limit: "1" });
    for (const [key, value] of Object.entries(query)) {
      params.set(key, `eq.${value}`);
    }

    const response = await this.request(`${table}?${params.toString()}`, { method: "GET" });
    if (!response.ok) {
      return this.degraded(table, response);
    }

    const rows = await response.json() as T[];
    return rows[0]
      ? { ok: true, action: "exists", object: table, data: rows[0] }
      : { ok: true, action: "skipped", object: table };
  }

  async upsert<T>(table: string, payload: Record<string, unknown>, conflictTarget?: string): Promise<AuthRepairResult<T>> {
    const path = conflictTarget ? `${table}?on_conflict=${encodeURIComponent(conflictTarget)}` : table;
    const response = await this.request(path, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return this.degraded(table, response);
    }

    const rows = await response.json() as T[];
    return { ok: true, action: "created", object: table, data: rows[0] };
  }

  async insert<T>(table: string, payload: Record<string, unknown>): Promise<AuthRepairResult<T>> {
    const response = await this.request(table, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return this.degraded(table, response);
    }

    const rows = await response.json() as T[];
    return { ok: true, action: "created", object: table, data: rows[0] };
  }

  async recordAuthEvent(eventType: AuthRepairEvent, userId?: string, metadata: Record<string, unknown> = {}): Promise<void> {
    await this.insert("auth_events", {
      user_id: userId,
      event_type: eventType,
      metadata,
    });
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    return fetch(`${this.config.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: this.config.serviceRoleKey,
        Authorization: `Bearer ${this.config.serviceRoleKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
  }

  private async degraded<T>(object: string, response: Response): Promise<AuthRepairResult<T>> {
    return {
      ok: false,
      action: "degraded",
      object,
      error: `${response.status} ${await response.text()}`,
    };
  }
}

export function workspaceSlug(email: string, userId: string): string {
  const prefix = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "zig-user";
  return `${prefix}-${userId.slice(0, 8)}`;
}

export function fullNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Zig User";
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Zig User";
}
