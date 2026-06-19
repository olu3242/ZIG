"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { FrameworkRegistry } from "@zig/framework-engine";
import { startGoogleOAuth } from "@zig/auth";
import { auditAuth, clearSession, requireSession, requireTenantContext, setSession, setTenantProfile } from "./auth";
import { createAuthProfile, findTenantProfileByAuthUserId, getZigServices, loginWithEmail, recordAuthEvent, requestPasswordReset, signUpWithEmail } from "./supabase";

export async function signupAction(formData: FormData): Promise<void> {
  const email = requireString(formData, "email");
  const password = requireString(formData, "password");
  const confirmPassword = requireString(formData, "confirmPassword");
  const fullName = formData.get("name")?.toString().trim();

  if (password.length < 8) {
    redirect("/signup?error=password_length");
  }

  if (password !== confirmPassword) {
    redirect("/signup?error=password_mismatch");
  }

  const session = await signUpWithEmail(email, password);

  if (session) {
    await setSession(session);
    await createAuthProfile({ id: session.userId, email: session.email, fullName, role: "practitioner" });
    await recordAuthEvent({ userId: session.userId, eventType: "signup", metadata: { provider: "email" } });
    await bridgeBootSequence();
    redirect("/onboarding");
  }

  redirect("/login?success=check_email");
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = requireString(formData, "email");
  const password = requireString(formData, "password");
  let session;
  try {
    console.log("[AUTH STEP]", "STEP_02_EMAIL_LOGIN");
    session = await loginWithEmail(email, password);
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    try {
      await recordAuthEvent({ eventType: "login_failed", metadata: { email, provider: "email" } });
    } catch (auditError) {
      console.error("[AUTH ERROR]", auditError);
    }
    redirect("/login?error=invalid_credentials");
  }

  await setSession(session);
  await createAuthProfile({ id: session.userId, email: session.email, role: "practitioner" });
  await recordAuthEvent({ userId: session.userId, eventType: "login", metadata: { provider: "email" } });
  const profile = await findTenantProfileByAuthUserId(session.userId);

  if (!profile) {
    redirect("/onboarding");
  }

  await setTenantProfile(profile.tenantId, profile.userId, profile.persona);
  await getZigServices().audit.recordAction(
    { tenantId: profile.tenantId, actorUserId: profile.userId },
    "login",
    "users",
    profile.userId,
    "User logged in",
  );
  await bridgeBootSequence();
  redirect("/dashboard");
}

export async function passwordResetAction(formData: FormData): Promise<void> {
  const email = requireString(formData, "email");
  await requestPasswordReset(email);
  await recordAuthEvent({ eventType: "password_reset_requested", metadata: { email } });
  redirect("/login?success=password_reset");
}

export async function googleOAuthAction(): Promise<void> {
  console.log("[AUTH STEP]", "STEP_03_OAUTH_ACTION");
  const origin = getRequestOrigin(await headers());
  const url = await startGoogleOAuth(`${origin}/oauth/callback`);
  redirect(url);
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
  const services = getZigServices();
  const project = await services.projects.createGovernanceProject(context, {
    name: requireString(formData, "name"),
    industry: formData.get("industry")?.toString(),
    frameworkId: requireString(formData, "frameworkId"),
  });
  await services.audit.recordAction(context, "assign", "project_frameworks", project.id, "Framework assigned to project");
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await auditAuth("logout", "User logged out");
  const session = await requireSession();
  await recordAuthEvent({ userId: session.userId, eventType: "logout" });
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

function bridgeBootSequence(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 800));
}

function getRequestOrigin(headerStore: Headers): string {
  const origin = headerStore.get("origin");
  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  if (!host) {
    throw new Error("Unable to resolve request origin for OAuth redirect.");
  }
  return `${proto}://${host}`;
}
