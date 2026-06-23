import { createSupabaseRepositories } from "@zig/data-access";
import { createServices } from "@zig/services";
import type { Persona } from "@zig/types";
import { validateAuthEnvironment } from "@zig/auth";

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  email: string;
}

export function getSupabaseConfig() {
  return validateAuthEnvironment();
}

export function getZigServices() {
  const { url, serviceRoleKey } = getSupabaseConfig();
  return createServices(createSupabaseRepositories({ url, serviceRoleKey }));
}

export interface TenantProfile {
  tenantId: string;
  userId: string;
  persona: Persona;
}

export async function findTenantProfileByAuthUserId(authUserId: string): Promise<TenantProfile | null> {
  const config = getSupabaseConfig();
  const params = new URLSearchParams({
    auth_user_id: `eq.${authUserId}`,
    select: "id,tenant_id,persona,status",
    limit: "1",
  });

  const response = await fetch(`${config.url}/rest/v1/users?${params.toString()}`, {
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

  const rows = await response.json() as Array<{ id: string; tenant_id: string; persona: Persona; status: string }>;
  const profile = rows.find((row) => row.status === "active") ?? rows[0];
  if (!profile) {
    return null;
  }

  return {
    tenantId: profile.tenant_id,
    userId: profile.id,
    persona: profile.persona,
  };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthSession | null> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/auth/v1/signup`, {
    method: "POST",
    headers: authHeaders(config.anonKey),
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = await response.json() as SupabaseAuthResponse;
  return toAuthSession(payload);
}

export async function loginWithEmail(email: string, password: string): Promise<AuthSession> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: authHeaders(config.anonKey),
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const session = toAuthSession(await response.json() as SupabaseAuthResponse);
  if (!session) {
    throw new Error("Login did not return a Supabase session.");
  }
  return session;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/auth/v1/recover`, {
    method: "POST",
    headers: authHeaders(config.anonKey),
    body: JSON.stringify({ email }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function createAuthProfile(input: { id: string; email: string; fullName?: string; role?: string }): Promise<void> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/profiles?on_conflict=user_id`, {
    method: "POST",
    headers: {
      ...authHeaders(config.serviceRoleKey),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      user_id: input.id,
      email: input.email,
      full_name: input.fullName ?? input.email,
      status: "active",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function recordAuthEvent(input: { userId?: string; eventType: string; ip?: string; metadata?: Record<string, unknown> }): Promise<void> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/auth_events`, {
    method: "POST",
    headers: authHeaders(config.serviceRoleKey),
    body: JSON.stringify({
      user_id: input.userId,
      event_type: input.eventType,
      ip: input.ip,
      metadata: input.metadata ?? {},
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

function authHeaders(apiKey: string): HeadersInit {
  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

interface SupabaseAuthResponse {
  access_token?: string;
  refresh_token?: string;
  user?: { id: string; email?: string };
}

function toAuthSession(payload: SupabaseAuthResponse): AuthSession | null {
  if (!payload.access_token || !payload.user?.id || !payload.user.email) {
    return null;
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    userId: payload.user.id,
    email: payload.user.email,
  };
}
