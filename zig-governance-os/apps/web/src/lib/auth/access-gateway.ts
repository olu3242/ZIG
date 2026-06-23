import { cookies } from "next/headers";
import type { Persona } from "@zig/types";
import { getSession } from "@/app/lib/auth";
import type { AuthSession } from "@/app/lib/supabase";
import { bootstrapAuthenticatedUser, onboardingRouteForBootstrap } from "./bootstrap";

export interface CurrentProfile {
  userId: string;
  email: string;
}

export interface CurrentOrganization {
  tenantId: string;
}

export interface CurrentMembership {
  userId: string;
  tenantId: string;
}

export interface CurrentRole {
  persona: Persona;
}

export interface AccessGatewayState {
  user: AuthSession | null;
  profile: CurrentProfile | null;
  organization: CurrentOrganization | null;
  membership: CurrentMembership | null;
  role: CurrentRole | null;
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  return getSession();
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return { userId: user.userId, email: user.email };
}

export async function getCurrentOrganization(): Promise<CurrentOrganization | null> {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get("zig_tenant_id")?.value;
  return tenantId ? { tenantId } : null;
}

export async function getCurrentMembership(): Promise<CurrentMembership | null> {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get("zig_tenant_id")?.value;
  const userId = cookieStore.get("zig_user_id")?.value;
  return tenantId && userId ? { tenantId, userId } : null;
}

export async function getCurrentRole(): Promise<CurrentRole | null> {
  const cookieStore = await cookies();
  const persona = cookieStore.get("zig_persona")?.value as Persona | undefined;
  return persona ? { persona } : null;
}

export async function getAccessGatewayState(): Promise<AccessGatewayState> {
  const [user, profile, organization, membership, role] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
    getCurrentOrganization(),
    getCurrentMembership(),
    getCurrentRole(),
  ]);

  return { user, profile, organization, membership, role };
}

export async function determineDestination(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    return "/login";
  }

  const state = await getAccessGatewayState();
  if (!state.profile) {
    return "/onboarding/profile";
  }
  if (!state.organization) {
    return "/onboarding/organization";
  }
  if (!state.membership || !state.role) {
    return "/onboarding/access";
  }

  return "/dashboard";
}

export async function determineDestinationWithRepair(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    return "/login";
  }

  const bootstrap = await bootstrapAuthenticatedUser(user);
  return bootstrap.status === "complete" ? "/dashboard" : onboardingRouteForBootstrap(bootstrap);
}

export const getCurrentOrganizationMembership = getCurrentMembership;
