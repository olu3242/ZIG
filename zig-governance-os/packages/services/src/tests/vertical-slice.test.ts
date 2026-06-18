import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertVerticalSlice(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const tenant = await services.tenants.createOrganization({
    name: "Acme Governance",
    slug: "acme-governance",
  });
  const context = { tenantId: tenant.id, actorUserId: "auth_user_1" };
  const user = await services.users.createProfile(context, {
    id: "user_1",
    authUserId: "auth_user_1",
    email: "owner@example.com",
    firstName: "Owner",
    lastName: "One",
    persona: "Tenant Admin",
  });
  const framework = await services.frameworks.create({ tenantId: tenant.id, actorUserId: user.id }, {
    id: "framework_1",
    code: "ISO27001",
    name: "ISO 27001",
    version: "2022",
    description: "Information security management system.",
    status: "active",
  });
  const project = await services.projects.createGovernanceProject({ tenantId: tenant.id, actorUserId: user.id }, {
    name: "MVP Project",
    frameworkId: framework.id,
    industry: "SaaS",
  });

  if (project.tenantId !== tenant.id || project.frameworkId !== framework.id) {
    throw new Error("Vertical slice did not preserve tenant and framework assignment.");
  }
}

void assertVerticalSlice();
