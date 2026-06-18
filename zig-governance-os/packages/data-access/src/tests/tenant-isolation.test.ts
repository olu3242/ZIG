import { createInMemoryRepositories } from "../repositories";
import type { TenantContext } from "../types";

async function assertTenantIsolation(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const tenantA: TenantContext = { tenantId: "tenant_a", actorUserId: "user_a" };
  const tenantB: TenantContext = { tenantId: "tenant_b", actorUserId: "user_b" };

  await repositories.projects.create(tenantA, {
    id: "project_a",
    name: "Tenant A Project",
    frameworkId: "framework_a",
    status: "active",
  });

  await repositories.projects.create(tenantB, {
    id: "project_b",
    name: "Tenant B Project",
    frameworkId: "framework_b",
    status: "active",
  });

  const tenantAProjects = await repositories.projects.findMany(tenantA);
  const crossTenantLookup = await repositories.projects.findById(tenantA, "project_b");

  if (tenantAProjects.length !== 1 || tenantAProjects[0].id !== "project_a") {
    throw new Error("Tenant query returned records outside the active tenant.");
  }

  if (crossTenantLookup !== null) {
    throw new Error("Cross-tenant findById returned a forbidden record.");
  }

  const auditEvents = await repositories.auditEvents.findByTenant("tenant_a");

  if (auditEvents.length !== 1 || auditEvents[0].action !== "create") {
    throw new Error("Create operation did not emit a tenant-scoped audit event.");
  }
}

void assertTenantIsolation();
