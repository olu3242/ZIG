import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertServiceLayerUsesTenantRepositories(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_service", actorUserId: "user_service" };

  await services.projects.create(context, {
    id: "project_service",
    name: "Service Project",
    frameworkId: "framework_service",
    status: "active",
  });

  const project = await services.projects.findById(context, "project_service");

  if (!project || project.tenantId !== context.tenantId) {
    throw new Error("Service layer did not preserve tenant context.");
  }
}

void assertServiceLayerUsesTenantRepositories();
