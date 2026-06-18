import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Persona } from "@zig/types";
import { getZigServices, type AuthSession } from "./supabase";

const sessionCookie = "zig_session";
const tenantCookie = "zig_tenant_id";
const userCookie = "zig_user_id";
const personaCookie = "zig_persona";

export async function setSession(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, JSON.stringify(session), { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function setTenantProfile(tenantId: string, userId: string, persona: Persona): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(tenantCookie, tenantId, { httpOnly: true, sameSite: "lax", path: "/" });
  cookieStore.set(userCookie, userId, { httpOnly: true, sameSite: "lax", path: "/" });
  cookieStore.set(personaCookie, persona, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  for (const name of [sessionCookie, tenantCookie, userCookie, personaCookie]) {
    cookieStore.delete(name);
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const raw = (await cookies()).get(sessionCookie)?.value;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireTenantContext() {
  const session = await requireSession();
  const cookieStore = await cookies();
  const tenantId = cookieStore.get(tenantCookie)?.value;
  const actorUserId = cookieStore.get(userCookie)?.value;
  const persona = cookieStore.get(personaCookie)?.value as Persona | undefined;

  if (!tenantId || !actorUserId || !persona) {
    redirect("/onboarding");
  }

  return { session, context: { tenantId, actorUserId }, persona };
}

export async function requirePlatformOwner() {
  const state = await requireTenantContext();
  if (state.persona !== "Platform Owner") {
    redirect("/dashboard");
  }
  return state;
}

export async function auditAuth(action: "login" | "logout", reason: string): Promise<void> {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get(tenantCookie)?.value;
  const actorUserId = cookieStore.get(userCookie)?.value;
  if (!tenantId || !actorUserId) {
    return;
  }
  await getZigServices().audit.recordAction({ tenantId, actorUserId }, action, "users", actorUserId, reason);
}
