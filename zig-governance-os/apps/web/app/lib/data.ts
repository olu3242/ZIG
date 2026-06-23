import { getZigServices } from "./supabase";
import { requireTenantContext } from "./auth";
import { listLifecycleFrameworks, listLifecycleProjects, loadCreateLifecycleMetrics } from "./lifecycle";
import { FrameworkRegistry } from "@zig/framework-engine";
import type { FrameworkRecord } from "@zig/data-access";

export async function loadDashboard() {
  const { context, persona } = await requireTenantContext();
  const services = getZigServices();
  const [tenant, lifecycleMetrics, frameworks] = await Promise.all([
    safeLoad(() => services.tenants.findProfileTenant(context), null),
    safeLoad(() => loadCreateLifecycleMetrics(context.tenantId), null),
    safeLoad(() => services.frameworks.findAvailableFrameworks(context), fallbackFrameworks()),
  ]);
  const projects = lifecycleMetrics?.projects.map((project) => ({
    id: project.projectId,
    tenantId: project.organizationId,
    name: project.name,
    industry: project.industry,
    frameworkId: project.frameworkFocus,
    status: project.status as "draft" | "active" | "paused" | "completed",
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.createdAt),
  })) ?? [];
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const createScore = lifecycleMetrics?.score ?? 0;

  return {
    tenant,
    persona,
    projects,
    frameworks,
    stats: {
      governanceScore: createScore,
      projectCount: projects.length,
      activeProjects,
      assetCount: lifecycleMetrics?.activeAssets.length ?? 0,
      controlCount: lifecycleMetrics?.activeControls.length ?? 0,
      relationshipCount: lifecycleMetrics?.mappings.length ?? 0,
      recentActivityCount: lifecycleMetrics?.activities.length ?? 0,
      frameworkCount: frameworks.length,
      onboardingState: createScore >= 100 ? "CREATE certified" : "CREATE in progress",
      resilientMode: tenant ? "ready" : "starter",
    },
  };
}

export async function loadProjects() {
  const { context } = await requireTenantContext();
  const [lifecycleProjects, lifecycleFrameworks] = await Promise.all([
    safeLoad(() => listLifecycleProjects(context.tenantId), []),
    safeLoad(() => listLifecycleFrameworks(), []),
  ]);
  const projects = lifecycleProjects.map((project) => ({
    id: project.projectId,
    tenantId: project.organizationId,
    name: project.name,
    industry: project.industry,
    frameworkId: project.frameworkFocus,
    status: project.status as "draft" | "active" | "paused" | "completed",
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.createdAt),
  }));
  const frameworks = lifecycleFrameworks.length > 0
    ? lifecycleFrameworks.map((framework) => ({
      id: framework.frameworkId,
      tenantId: context.tenantId,
      code: framework.code,
      name: framework.name,
      version: framework.version,
      description: framework.description,
      status: "active" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    : fallbackFrameworks();

  return { projects, frameworks };
}

export async function loadFrameworks() {
  const { context } = await requireTenantContext();
  return safeLoad(async () => {
    const frameworks = await listLifecycleFrameworks();
    return frameworks.map((framework) => ({
      id: framework.frameworkId,
      tenantId: context.tenantId,
      code: framework.code,
      name: framework.name,
      version: framework.version,
      description: framework.description,
      status: "active" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }, fallbackFrameworks());
}

async function safeLoad<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error("[AUTH WARN]", "protected data loader fallback", error);
    return fallback;
  }
}

function fallbackFrameworks(): FrameworkRecord[] {
  return FrameworkRegistry.list().map((framework) => ({
    id: framework.code.toLowerCase(),
    tenantId: "starter",
    code: framework.code,
    name: framework.name,
    version: framework.version,
    description: framework.description,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}
