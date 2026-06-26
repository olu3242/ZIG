"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Persona } from "@zig/types";
import { requireSession, setTenantProfile } from "@/app/lib/auth";
import { getSupabaseConfig } from "@/app/lib/supabase";
import { dispatchDomainEvent, webAccessSubject } from "@/app/lib/agent-os";

const frameworkLabels: Record<string, string> = {
  nist_csf: "NIST CSF",
  nist_rmf: "NIST RMF",
  iso27001: "ISO 27001",
  soc2: "SOC 2",
  cobit: "COBIT",
  cis: "CIS Controls",
  hipaa: "HIPAA",
  pci_dss: "PCI DSS",
  hitrust: "HITRUST",
  fedramp: "FedRAMP",
  gdpr: "GDPR",
};

export async function profileSetupAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const firstName = requireString(formData, "firstName");
  const lastName = requireString(formData, "lastName");
  const displayName = formData.get("displayName")?.toString().trim() || `${firstName} ${lastName}`;

  await upsert("profiles", {
    user_id: session.userId,
    email: session.email,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName,
    full_name: `${firstName} ${lastName}`,
    avatar_url: formData.get("avatarUrl")?.toString().trim() || null,
    status: "active",
  }, "user_id");

  await updateProgress(session.userId, { profile_complete: true, current_step: "organization" });
  redirect("/onboarding/organization");
}

export async function organizationSetupAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const workspaceName = requireString(formData, "workspaceName");
  const workspaceType = requireString(formData, "workspaceType");
  const organizationId = crypto.randomUUID();
  const slug = `${slugify(workspaceName)}-${session.userId.slice(0, 8)}`;

  await upsert("organizations", {
    organization_id: organizationId,
    name: workspaceName,
    slug,
    status: "active",
  }, "slug");

  await upsert("profiles", {
    user_id: session.userId,
    email: session.email,
    organization_default_id: organizationId,
    status: "active",
  }, "user_id");

  await upsert("organization_memberships", {
    organization_id: organizationId,
    user_id: session.userId,
    role_name: workspaceType === "company" ? "manager" : "admin",
    status: "active",
    created_by: session.userId,
  }, "organization_id,user_id");

  await setTenantProfile(organizationId, session.userId, workspaceType === "company" ? "Governance Manager" : "Tenant Admin");
  await updateProgress(session.userId, { organization_complete: true, current_step: "experience" });
  redirect("/onboarding/experience");
}

export async function experienceSetupAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const persona = requireString(formData, "persona");

  await upsert("profiles", {
    user_id: session.userId,
    email: session.email,
    user_persona: persona,
    status: "active",
  }, "user_id");

  await updateProgress(session.userId, { role_complete: true, current_step: "frameworks" });
  redirect("/onboarding/frameworks");
}

export async function frameworksSetupAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const frameworks = formData.getAll("frameworks").map(String);

  await upsert("profiles", {
    user_id: session.userId,
    email: session.email,
    framework_interests: frameworks,
    status: "active",
  }, "user_id");

  await updateProgress(session.userId, { frameworks_selected: frameworks.length > 0, current_step: "career-goals" });
  await emitFrameworksSelectedEvent(session.userId, frameworks);
  redirect("/onboarding/career-goals");
}

/**
 * Real production caller of emitDomainEvent("framework.selected") — fires once per framework
 * the user selects during onboarding. Additive only: governance/agent-runtime failures are
 * caught and logged inside dispatchDomainEvent() and never block the onboarding redirect.
 */
async function emitFrameworksSelectedEvent(userId: string, frameworks: string[]): Promise<void> {
  if (frameworks.length === 0) {
    return;
  }
  const cookieStore = await cookies();
  const tenantId = cookieStore.get("zig_tenant_id")?.value;
  const persona = cookieStore.get("zig_persona")?.value;
  if (!tenantId || !persona) {
    return;
  }
  const subject = webAccessSubject({ tenantId, userId, persona });
  for (const frameworkCode of frameworks) {
    await dispatchDomainEvent({
      domainEventType: "framework.selected",
      subject,
      context: { tenantId, userId, organizationId: tenantId, persona: persona as Persona },
      eventId: `web-onboarding:framework-selected:${userId}:${frameworkCode}`,
      payload: { subjectId: frameworkCode, frameworkCode },
    });
  }
}

export async function careerGoalsSetupAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const goals = formData.getAll("goals").map(String);

  await upsert("profiles", {
    user_id: session.userId,
    email: session.email,
    career_goals: goals,
    status: "active",
  }, "user_id");

  await updateProgress(session.userId, { goals_selected: goals.length > 0, current_step: "review" });
  redirect("/onboarding/review");
}

export async function completeOnboardingAction(): Promise<void> {
  const session = await requireSession();
  const profile = await getOne<{ user_persona?: string; framework_interests?: string[]; career_goals?: string[] }>("profiles", { user_id: session.userId });
  const persona = profile?.user_persona ?? "Student";
  const frameworks = profile?.framework_interests?.length ? profile.framework_interests : ["nist_csf", "iso27001", "soc2"];
  const goals = profile?.career_goals?.length ? profile.career_goals : ["governance"];
  const assignedPath = assignLearningPath(persona);

  await upsert("user_learning_profiles", {
    user_id: session.userId,
    assigned_path: assignedPath,
    current_module: "GRC Orientation",
    framework_recommendations: frameworks.map((key) => frameworkLabels[key] ?? key),
    lab_recommendations: ["Build a starter risk register", "Map controls to evidence", "Prepare an audit-ready artifact"],
    certification_recommendations: certificationRecommendations(frameworks),
    career_roadmap: roadmapForGoals(goals),
  }, "user_id");

  await updateProgress(session.userId, {
    learning_path_assigned: true,
    completed: true,
    current_step: "complete",
  });

  redirect("/onboarding/complete");
}

async function updateProgress(userId: string, patch: Record<string, unknown>) {
  await upsert("onboarding_progress", {
    user_id: userId,
    ...patch,
    updated_at: new Date().toISOString(),
  }, "user_id");
}

async function upsert(table: string, payload: Record<string, unknown>, conflictTarget: string) {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflictTarget)}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function getOne<T>(table: string, query: Record<string, string>): Promise<T | null> {
  const config = getSupabaseConfig();
  const params = new URLSearchParams({ select: "*", limit: "1" });
  for (const [key, value] of Object.entries(query)) {
    params.set(key, `eq.${value}`);
  }
  const response = await fetch(`${config.url}/rest/v1/${table}?${params.toString()}`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  const rows = await response.json() as T[];
  return rows[0] ?? null;
}

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key)?.toString().trim();
  if (!value) {
    throw new Error(`${key} is required.`);
  }
  return value;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "zig-workspace";
}

function assignLearningPath(persona: string): string {
  if (persona.includes("Auditor")) {
    return "Audit & Controls Path";
  }
  if (persona.includes("Compliance")) {
    return "Compliance Analyst Path";
  }
  if (persona.includes("Risk")) {
    return "Risk Management Path";
  }
  if (persona.includes("Security") || persona.includes("IT")) {
    return "Security Governance Path";
  }
  return "GRC Foundations";
}

function certificationRecommendations(frameworks: string[]): string[] {
  const recommendations = new Set(["ZIG GRC Foundations"]);
  if (frameworks.includes("iso27001")) {
    recommendations.add("ISO 27001 Foundation");
  }
  if (frameworks.includes("soc2")) {
    recommendations.add("SOC 2 Analyst");
  }
  if (frameworks.includes("nist_csf") || frameworks.includes("nist_rmf")) {
    recommendations.add("NIST Governance Practitioner");
  }
  return [...recommendations];
}

function roadmapForGoals(goals: string[]): string[] {
  if (goals.includes("get_first_grc_job") || goals.includes("transition_grc")) {
    return ["Complete GRC Foundations", "Build portfolio artifacts", "Practice interview-ready scenarios"];
  }
  if (goals.includes("audit")) {
    return ["Learn audit language", "Map controls", "Generate audit evidence"];
  }
  return ["Complete orientation", "Select first framework", "Launch first practice lab"];
}
