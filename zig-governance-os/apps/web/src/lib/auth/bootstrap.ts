import type { Persona } from "@zig/types";
import { getSupabaseConfig, type AuthSession } from "@/app/lib/supabase";
import { AuthRepairClient, fullNameFromEmail, workspaceSlug, type AuthRepairResult } from "./repair";

export interface BootstrapContext {
  tenantId: string;
  userId: string;
  persona: Persona;
  organizationId?: string;
}

export interface BootstrapValidation {
  status: "complete" | "needs_onboarding" | "degraded";
  context?: BootstrapContext;
  repairs: AuthRepairResult[];
  reason?: string;
}

interface ProfileRow {
  user_id: string;
  email?: string;
  full_name?: string;
  organization_default_id?: string;
}

interface RoleRow {
  role_name: string;
  description?: string;
}

interface OrganizationRow {
  organization_id: string;
  name: string;
  slug?: string;
}

const defaultRoles = [
  ["student", "Learning and practice access."],
  ["professional", "Operational GRC practitioner access."],
  ["instructor", "Learning and lab management access."],
  ["manager", "Manager access for workspace oversight."],
  ["admin", "Workspace administration access."],
  ["super_admin", "Platform-level administration access."],
] as const;

export async function bootstrapAuthenticatedUser(session: AuthSession): Promise<BootstrapValidation> {
  const config = getSupabaseConfig();
  const client = new AuthRepairClient({ url: config.url, serviceRoleKey: config.serviceRoleKey });
  const repairs: AuthRepairResult[] = [];

  const profile = await ensureUserProfile(client, session);
  repairs.push(profile);
  if (!profile.ok) {
    return degraded("profiles unavailable", repairs);
  }

  const existingMembership = await client.getOne<{ organization_id: string; user_id: string; role_name: string }>("organization_memberships", {
    user_id: session.userId,
  });
  repairs.push(existingMembership);
  if (existingMembership.ok && existingMembership.data) {
    const roleRepair = await ensureDefaultRole(client, existingMembership.data.organization_id, "admin");
    repairs.push(...roleRepair);
    await safeEvent(client, "SESSION_RECOVERED", session.userId, { organization_id: existingMembership.data.organization_id });
    return {
      status: "complete",
      repairs,
      context: {
        tenantId: existingMembership.data.organization_id,
        userId: existingMembership.data.user_id,
        persona: personaForRole(existingMembership.data.role_name),
        organizationId: existingMembership.data.organization_id,
      },
    };
  }

  if (!existingMembership.ok && existingMembership.error?.includes("404")) {
    return degraded("membership unavailable", repairs);
  }

  const organization = await ensureOrganization(client, session);
  repairs.push(...organization.repairs);
  if (!organization.organization) {
    return degraded("organization unavailable", repairs);
  }

  const roles = await ensureDefaultRole(client, organization.organization.organization_id, "admin");
  repairs.push(...roles);

  const membership = await ensureMembership(client, {
    session,
    organizationId: organization.organization.organization_id,
  });
  repairs.push(...membership.repairs);
  if (!membership.membership) {
    return degraded("membership unavailable", repairs);
  }

  const learning = await ensureLearningProfile(client, organization.organization.organization_id, session.userId);
  repairs.push(...learning);

  await safeEvent(client, "SESSION_RECOVERED", session.userId, { organization_id: organization.organization.organization_id, user_id: session.userId });

  return {
    status: "complete",
    repairs,
    context: {
      tenantId: organization.organization.organization_id,
      userId: session.userId,
      persona: "Tenant Admin",
      organizationId: organization.organization.organization_id,
    },
  };
}

export const ensureProfile = ensureUserProfile;
export const ensureRole = ensureDefaultRole;

export function onboardingRouteForBootstrap(validation: BootstrapValidation): string {
  if (validation.status === "complete") {
    return "/dashboard";
  }

  const reason = validation.reason ?? "tenant_context";
  if (reason.includes("profiles")) {
    return "/onboarding/profile";
  }
  if (reason.includes("organization")) {
    return "/onboarding/organization";
  }
  if (reason.includes("membership") || reason.includes("users")) {
    return "/onboarding/access";
  }
  return `/onboarding?reason=${encodeURIComponent(reason)}`;
}

export async function ensureUserProfile(client: AuthRepairClient, session: AuthSession): Promise<AuthRepairResult<ProfileRow>> {
  const result = await client.upsert<ProfileRow>("profiles", {
    user_id: session.userId,
    email: session.email,
    full_name: fullNameFromEmail(session.email),
    status: "active",
  }, "user_id");

  if (result.ok) {
    await safeEvent(client, "PROFILE_CREATED", session.userId);
  }
  return result;
}

export async function ensureOrganization(client: AuthRepairClient, session: AuthSession): Promise<{ organization?: OrganizationRow; repairs: AuthRepairResult[] }> {
  const repairs: AuthRepairResult[] = [];
  const slug = workspaceSlug(session.email, session.userId);
  const name = `${fullNameFromEmail(session.email)} Workspace`;

  const organization = await client.upsert<OrganizationRow>("organizations", {
    organization_id: crypto.randomUUID(),
    name,
    slug,
    status: "active",
  }, "slug");
  repairs.push(organization);
  if (organization.ok && organization.data) {
    repairs.push(await client.upsert<ProfileRow>("profiles", {
      user_id: session.userId,
      email: session.email,
      full_name: fullNameFromEmail(session.email),
      organization_default_id: organization.data.organization_id,
      status: "active",
    }, "user_id"));
    await safeEvent(client, "ORG_CREATED", session.userId, { organization_id: organization.data.organization_id });
  }

  return { organization: organization.data, repairs };
}

export async function ensureDefaultRole(client: AuthRepairClient, organizationId: string, assignedRole: string): Promise<AuthRepairResult<RoleRow>[]> {
  const repairs: AuthRepairResult<RoleRow>[] = [];
  for (const [name, description] of defaultRoles) {
    const repair = await client.upsert<RoleRow>("roles", {
      role_name: name,
      description,
    }, "role_name");
    repairs.push(repair);
  }
  await safeEvent(client, "ROLE_ASSIGNED", undefined, { organization_id: organizationId, role: assignedRole });
  return repairs;
}

export async function ensureMembership(
  client: AuthRepairClient,
  input: { session: AuthSession; organizationId: string },
): Promise<{ membership?: { id: string; organization_id: string; user_id: string; role_name: string }; repairs: AuthRepairResult[] }> {
  const repairs: AuthRepairResult[] = [];
  const membership = await client.upsert<{ id: string; organization_id: string; user_id: string; role_name: string }>("organization_memberships", {
    organization_id: input.organizationId,
    user_id: input.session.userId,
    role_name: "admin",
    status: "active",
  }, "organization_id,user_id");
  repairs.push(membership);
  if (membership.ok) {
    await safeEvent(client, "MEMBERSHIP_CREATED", input.session.userId, { organization_id: input.organizationId });
  }

  return { membership: membership.data, repairs };
}

export async function ensureLearningProfile(client: AuthRepairClient, tenantId: string, userId: string): Promise<AuthRepairResult[]> {
  const progress: AuthRepairResult = { ok: true, action: "skipped", object: "learning_profiles", data: { tenantId, userId } };
  await safeEvent(client, "LEARNING_PROFILE_READY", undefined, { tenant_id: tenantId, user_id: userId });
  return [progress];
}

async function safeEvent(client: AuthRepairClient, eventType: Parameters<AuthRepairClient["recordAuthEvent"]>[0], userId?: string, metadata?: Record<string, unknown>) {
  try {
    await client.recordAuthEvent(eventType, userId, metadata);
  } catch {
    // Observability should never block auth recovery.
  }
}

function personaForRole(roleName: string): Persona {
  if (roleName === "super_admin") {
    return "Platform Owner";
  }
  if (["admin", "manager", "instructor"].includes(roleName)) {
    return "Tenant Admin";
  }
  return "Learner";
}

function degraded(reason: string, repairs: AuthRepairResult[]): BootstrapValidation {
  return { status: "degraded", repairs, reason };
}
