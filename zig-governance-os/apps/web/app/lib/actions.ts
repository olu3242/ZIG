"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { FrameworkRegistry } from "@zig/framework-engine";
import { startGoogleOAuth } from "@zig/auth";
import { bootstrapAuthenticatedUser, onboardingRouteForBootstrap } from "@/src/lib/auth/bootstrap";
import {
  archiveLifecycleAsset,
  archiveLifecycleControl,
  archiveLifecycleProject,
  createLifecycleAsset,
  createLifecycleControl,
  createLifecycleProject,
  linkLifecycleAssetControl,
  updateLifecycleAsset,
  updateLifecycleControl,
  updateLifecycleProject,
} from "@/app/lib/lifecycle";
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
    await safeCreateAuthProfile({ id: session.userId, email: session.email, fullName, role: "practitioner" });
    await safeRecordAuthEvent({ userId: session.userId, eventType: "signup", metadata: { provider: "email" } });
    const bootstrap = await bootstrapAuthenticatedUser(session);
    if (bootstrap.status === "complete" && bootstrap.context) {
      await setTenantProfile(bootstrap.context.tenantId, bootstrap.context.userId, bootstrap.context.persona);
      await bridgeBootSequence();
      redirect("/dashboard");
    }
    await bridgeBootSequence();
    redirect(onboardingRouteForBootstrap(bootstrap));
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
    await safeRecordAuthEvent({ eventType: "LOGIN_FAILURE", metadata: { email, provider: "email" } });
    redirect("/login?error=invalid_credentials");
  }

  await setSession(session);
  await safeCreateAuthProfile({ id: session.userId, email: session.email, role: "practitioner" });
  await safeRecordAuthEvent({ userId: session.userId, eventType: "LOGIN_SUCCESS", metadata: { provider: "email" } });
  const bootstrap = await bootstrapAuthenticatedUser(session);
  if (bootstrap.status === "complete" && bootstrap.context) {
    await setTenantProfile(bootstrap.context.tenantId, bootstrap.context.userId, bootstrap.context.persona);
    await safeAuditLogin(
      { tenantId: bootstrap.context.tenantId, actorUserId: bootstrap.context.userId },
      bootstrap.context.userId,
    );
    await bridgeBootSequence();
    redirect("/dashboard");
  }

  const profile = await safeFindTenantProfileByAuthUserId(session.userId);
  if (profile) {
    await setTenantProfile(profile.tenantId, profile.userId, profile.persona);
    await safeAuditLogin({ tenantId: profile.tenantId, actorUserId: profile.userId }, profile.userId);
    await bridgeBootSequence();
    redirect("/dashboard");
  }

  await bridgeBootSequence();
  redirect(onboardingRouteForBootstrap(bootstrap));
}

export async function passwordResetAction(formData: FormData): Promise<void> {
  const email = requireString(formData, "email");
  await requestPasswordReset(email);
  await safeRecordAuthEvent({ eventType: "password_reset_requested", metadata: { email } });
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
  const project = await createLifecycleProject({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    name: requireString(formData, "name"),
    industry: requireString(formData, "industry"),
    frameworkFocus: requireString(formData, "frameworkId"),
    description: formData.get("description")?.toString().trim() ?? "",
    status: formData.get("status")?.toString().trim() || "draft",
  });
  redirect(`/projects/${project.projectId}`);
}

export async function createAssetAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  await createLifecycleAsset({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    projectId,
    name: requireString(formData, "name"),
    assetType: requireString(formData, "assetType"),
    classification: requireString(formData, "classification"),
    criticality: requireString(formData, "criticality"),
    description: formData.get("description")?.toString().trim() ?? "",
  });
  redirect(`/projects/${projectId}`);
}

export async function createControlAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  await createLifecycleControl({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    projectId,
    name: requireString(formData, "name"),
    description: formData.get("description")?.toString().trim() ?? "",
    status: requireString(formData, "status"),
    effectiveness: Number(formData.get("effectiveness")?.toString() ?? "0"),
  });
  redirect(`/projects/${projectId}`);
}

export async function linkAssetControlAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  await linkLifecycleAssetControl({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    projectId,
    assetId: requireString(formData, "assetId"),
    controlId: requireString(formData, "controlId"),
    relationshipType: formData.get("relationshipType")?.toString().trim() || "protects",
  });
  redirect(`/projects/${projectId}`);
}

export async function updateProjectAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  await updateLifecycleProject({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    projectId,
    name: requireString(formData, "name"),
    industry: requireString(formData, "industry"),
    description: formData.get("description")?.toString().trim() ?? "",
    status: requireString(formData, "status"),
  });
  redirect(`/projects/${projectId}`);
}

export async function updateAssetAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  await updateLifecycleAsset({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    projectId,
    assetId: requireString(formData, "assetId"),
    name: requireString(formData, "name"),
    assetType: requireString(formData, "assetType"),
    classification: requireString(formData, "classification"),
    criticality: requireString(formData, "criticality"),
    description: formData.get("description")?.toString().trim() ?? "",
    status: requireString(formData, "status"),
  });
  redirect(`/projects/${projectId}`);
}

export async function updateControlAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  await updateLifecycleControl({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    projectId,
    controlId: requireString(formData, "controlId"),
    name: requireString(formData, "name"),
    description: formData.get("description")?.toString().trim() ?? "",
    status: requireString(formData, "status"),
    effectiveness: Number(formData.get("effectiveness")?.toString() ?? "0"),
  });
  redirect(`/projects/${projectId}`);
}

export async function archiveProjectAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  await archiveLifecycleProject({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    projectId,
  });
  redirect("/projects");
}

export async function archiveAssetAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  await archiveLifecycleAsset({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    projectId,
    assetId: requireString(formData, "assetId"),
  });
  redirect(`/projects/${projectId}`);
}

export async function archiveControlAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  await archiveLifecycleControl({
    organizationId: context.tenantId,
    actorUserId: context.actorUserId,
    projectId,
    controlId: requireString(formData, "controlId"),
  });
  redirect(`/projects/${projectId}`);
}

export async function logoutAction(): Promise<void> {
  await auditAuth("logout", "User logged out");
  const session = await requireSession();
  await safeRecordAuthEvent({ userId: session.userId, eventType: "logout" });
  await clearSession();
  redirect("/login");
}

async function safeCreateAuthProfile(input: { id: string; email: string; fullName?: string; role?: string }): Promise<void> {
  try {
    await createAuthProfile(input);
  } catch (error) {
    console.error("[AUTH WARN]", "profile bootstrap skipped", error);
  }
}

async function safeRecordAuthEvent(input: { userId?: string; eventType: string; ip?: string; metadata?: Record<string, unknown> }): Promise<void> {
  try {
    await recordAuthEvent(input);
  } catch (error) {
    console.error("[AUTH WARN]", "auth event skipped", error);
  }
}

async function safeFindTenantProfileByAuthUserId(authUserId: string) {
  try {
    return await findTenantProfileByAuthUserId(authUserId);
  } catch (error) {
    console.error("[AUTH WARN]", "tenant profile lookup failed", error);
    return null;
  }
}

async function safeAuditLogin(context: { tenantId: string; actorUserId: string }, profileUserId: string): Promise<void> {
  try {
    await getZigServices().audit.recordAction(context, "login", "users", profileUserId, "User logged in");
  } catch (error) {
    console.error("[AUTH WARN]", "tenant login audit skipped", error);
  }
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
