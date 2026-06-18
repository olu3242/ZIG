"use server";

import { redirect } from "next/navigation";
import { FrameworkRegistry } from "@zig/framework-engine";
import { auditAuth, clearSession, requireSession, requireTenantContext, setSession, setTenantProfile } from "./auth";
import { getZigServices, loginWithEmail, requestPasswordReset, signUpWithEmail } from "./supabase";

export async function signupAction(formData: FormData): Promise<void> {
  const email = requireString(formData, "email");
  const password = requireString(formData, "password");
  const session = await signUpWithEmail(email, password);

  if (session) {
    await setSession(session);
    redirect("/onboarding");
  }

  redirect("/login");
}

export async function loginAction(formData: FormData): Promise<void> {
  const session = await loginWithEmail(requireString(formData, "email"), requireString(formData, "password"));
  await setSession(session);
  redirect("/onboarding");
}

export async function passwordResetAction(formData: FormData): Promise<void> {
  await requestPasswordReset(requireString(formData, "email"));
  redirect("/login");
}

export async function onboardingAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const services = getZigServices();
  const tenant = await services.tenants.createOrganization({
    name: requireString(formData, "organizationName"),
    slug: requireString(formData, "organizationSlug"),
    ownerUserId: session.userId,
  });
  const user = await services.users.createProfile(
    { tenantId: tenant.id, actorUserId: session.userId },
    {
      id: crypto.randomUUID(),
      authUserId: session.userId,
      email: session.email,
      firstName: requireString(formData, "firstName"),
      lastName: requireString(formData, "lastName"),
      role: "Tenant Admin",
      persona: "Tenant Admin",
    },
  );

  for (const framework of FrameworkRegistry.list()) {
    await services.frameworks.create(
      { tenantId: tenant.id, actorUserId: user.id },
      {
        id: crypto.randomUUID(),
        code: framework.code,
        name: framework.name,
        version: framework.version,
        description: framework.description,
        status: "active",
      },
    );
  }

  await setTenantProfile(tenant.id, user.id, user.persona);
  redirect("/projects/new");
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  await getZigServices().projects.createGovernanceProject(context, {
    name: requireString(formData, "name"),
    industry: formData.get("industry")?.toString(),
    frameworkId: requireString(formData, "frameworkId"),
  });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await auditAuth("logout", "User logged out");
  await clearSession();
  redirect("/login");
}

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key)?.toString().trim();
  if (!value) {
    throw new Error(`${key} is required.`);
  }
  return value;
}
