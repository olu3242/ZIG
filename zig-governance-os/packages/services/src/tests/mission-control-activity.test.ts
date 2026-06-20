import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertRecentActivityIsRealAndTenantScoped(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_activity", actorUserId: "user_activity" };
  const otherContext = { tenantId: "tenant_other", actorUserId: "user_other" };

  const empty = await services.audit.findRecentActivity(context);
  if (empty.length !== 0) {
    throw new Error("Expected no recent activity before any audited action.");
  }

  await services.projects.create(context, {
    id: "project_activity",
    name: "Activity Project",
    frameworkId: "framework_activity",
    status: "active",
  });
  await services.projects.create(otherContext, {
    id: "project_other",
    name: "Other Tenant Project",
    frameworkId: "framework_other",
    status: "active",
  });

  const activity = await services.audit.findRecentActivity(context);
  if (activity.length === 0 || activity.some((event) => event.entityId !== "project_activity")) {
    throw new Error(`Expected only tenant-scoped audit events for project_activity, got ${JSON.stringify(activity)}.`);
  }
}

void assertRecentActivityIsRealAndTenantScoped();
