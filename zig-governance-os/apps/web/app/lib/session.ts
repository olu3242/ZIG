import { permissionsForRole } from "@zig/governance-engine";
import type { Role, Tenant, TenantSettings, TenantSubscription, User } from "@zig/types";
import { frameworks, tenantId } from "@/app/lib/mock-data";

const now = new Date("2026-06-17T21:00:00.000Z");

export const currentTenant: Tenant = {
  id: tenantId,
  tenantId,
  name: "Demo SaaS Company",
  slug: "demo-saas-company",
  status: "active",
  createdAt: new Date("2026-06-01T14:00:00.000Z"),
  updatedAt: now,
};

export const currentUser: User = {
  id: "user_grc_manager",
  tenantId,
  email: "grc.manager@demo.zig",
  firstName: "Maya",
  lastName: "Chen",
  role: "GRC Manager",
  status: "active",
  createdAt: new Date("2026-06-02T14:00:00.000Z"),
  updatedAt: now,
};

export const currentSubscription: TenantSubscription = {
  tenantId,
  plan: "business",
  status: "trialing",
  seats: 12,
  currentPeriodEndsAt: new Date("2026-07-01T14:00:00.000Z"),
};

export const currentTenantSettings: TenantSettings = {
  tenantId,
  branding: {
    tenantId,
    displayName: "Demo SaaS Company",
    primaryColor: "#15202B",
    accentColor: "#D9A441",
  },
  preferredFrameworkIds: frameworks.slice(0, 3).map((framework) => framework.id),
  riskAppetite: "moderate",
  governanceTargets: {
    minimumHealthScore: 80,
    evidenceCoverage: 75,
    assessmentCompletion: 70,
  },
  updatedAt: now,
};

export const currentRole: Role = permissionsForRole(currentUser.role, tenantId);

export function getCurrentUser(): User {
  return currentUser;
}

export function getCurrentTenant(): Tenant {
  return currentTenant;
}

export function getCurrentRole(): Role {
  return currentRole;
}

export function getCurrentTenantSettings(): TenantSettings {
  return currentTenantSettings;
}
