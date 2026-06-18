import { createSupabaseRepositories } from "@zig/data-access";
import { createServices } from "@zig/services";
import type { Persona } from "@zig/types";

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  email: string;
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase environment is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return { url, anonKey, serviceRoleKey };
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
