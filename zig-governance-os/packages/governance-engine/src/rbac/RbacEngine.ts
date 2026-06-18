import type { Permission, Role, RoleName, User } from "@zig/types";

export type RbacAction = Permission["action"];
export type RbacResource =
  | "tenant"
  | "users"
  | "settings"
  | "projects"
  | "frameworks"
  | "assets"
  | "risks"
  | "controls"
  | "evidence"
  | "tasks"
  | "learning"
  | "reports";

export interface AccessSubject {
  user: Pick<User, "id" | "tenantId" | "role" | "status">;
  tenantId: string;
}

const rolePermissions: Record<RoleName, Partial<Record<RbacResource, RbacAction[]>>> = {
  "Platform Admin": {
    tenant: ["view", "create", "edit", "delete", "approve"],
    users: ["view", "create", "edit", "delete", "approve"],
    settings: ["view", "create", "edit", "delete", "approve"],
    projects: ["view", "create", "edit", "delete", "approve"],
    frameworks: ["view", "create", "edit", "delete", "approve"],
    assets: ["view", "create", "edit", "delete", "approve"],
    risks: ["view", "create", "edit", "delete", "approve"],
    controls: ["view", "create", "edit", "delete", "approve"],
    evidence: ["view", "create", "edit", "delete", "approve"],
    tasks: ["view", "create", "edit", "delete", "approve"],
    learning: ["view", "create", "edit", "delete", "approve"],
    reports: ["view", "create", "edit", "delete", "approve"],
  },
  "Tenant Admin": {
    tenant: ["view", "edit", "approve"],
    users: ["view", "create", "edit", "delete", "approve"],
    settings: ["view", "edit", "approve"],
    projects: ["view", "create", "edit", "delete", "approve"],
    frameworks: ["view", "edit", "approve"],
    assets: ["view", "create", "edit", "delete", "approve"],
    risks: ["view", "create", "edit", "delete", "approve"],
    controls: ["view", "create", "edit", "delete", "approve"],
    evidence: ["view", "create", "edit", "delete", "approve"],
    tasks: ["view", "create", "edit", "delete", "approve"],
    learning: ["view", "create", "edit"],
    reports: ["view", "create", "edit", "approve"],
  },
  "Organization Admin": {
    tenant: ["view", "edit", "approve"],
    users: ["view", "create", "edit", "approve"],
    settings: ["view", "edit", "approve"],
    projects: ["view", "create", "edit", "approve"],
    frameworks: ["view"],
    assets: ["view", "create", "edit", "approve"],
    risks: ["view", "create", "edit", "approve"],
    controls: ["view", "create", "edit", "approve"],
    evidence: ["view", "create", "edit", "approve"],
    tasks: ["view", "create", "edit", "approve"],
    learning: ["view"],
    reports: ["view", "create", "edit", "approve"],
  },
  "GRC Manager": {
    projects: ["view", "create", "edit", "approve"],
    frameworks: ["view"],
    assets: ["view", "create", "edit", "approve"],
    risks: ["view", "create", "edit", "approve"],
    controls: ["view", "create", "edit", "approve"],
    evidence: ["view", "create", "edit", "approve"],
    tasks: ["view", "create", "edit", "approve"],
    learning: ["view"],
    reports: ["view", "create", "edit", "approve"],
  },
  Auditor: {
    projects: ["view"],
    frameworks: ["view"],
    assets: ["view"],
    risks: ["view"],
    controls: ["view"],
    evidence: ["view", "approve"],
    tasks: ["view"],
    reports: ["view", "create"],
  },
  Analyst: {
    projects: ["view"],
    frameworks: ["view"],
    assets: ["view", "create", "edit"],
    risks: ["view", "create", "edit"],
    controls: ["view", "create", "edit"],
    evidence: ["view", "create", "edit"],
    tasks: ["view", "create", "edit"],
    learning: ["view"],
    reports: ["view"],
  },
  "Risk Analyst": {
    projects: ["view"],
    assets: ["view", "create", "edit"],
    risks: ["view", "create", "edit"],
    controls: ["view"],
    evidence: ["view"],
    tasks: ["view", "create", "edit"],
    learning: ["view"],
    reports: ["view"],
  },
  "Compliance Analyst": {
    projects: ["view"],
    frameworks: ["view"],
    controls: ["view", "create", "edit"],
    evidence: ["view", "create", "edit"],
    tasks: ["view", "create", "edit"],
    learning: ["view"],
    reports: ["view"],
  },
  Consultant: {
    tenant: ["view"],
    users: ["view"],
    settings: ["view"],
    projects: ["view", "create", "edit", "approve"],
    frameworks: ["view"],
    assets: ["view", "create", "edit"],
    risks: ["view", "create", "edit"],
    controls: ["view", "create", "edit"],
    evidence: ["view", "create", "edit"],
    tasks: ["view", "create", "edit"],
    learning: ["view"],
    reports: ["view", "create", "edit"],
  },
  Learner: {
    projects: ["view"],
    frameworks: ["view"],
    learning: ["view", "create", "edit"],
  },
  Viewer: {
    tenant: ["view"],
    projects: ["view"],
    frameworks: ["view"],
    assets: ["view"],
    risks: ["view"],
    controls: ["view"],
    evidence: ["view"],
    tasks: ["view"],
    learning: ["view"],
    reports: ["view"],
  },
};

export function canView(subject: AccessSubject, resource: RbacResource): boolean {
  return can(subject, resource, "view");
}

export function canCreate(subject: AccessSubject, resource: RbacResource): boolean {
  return can(subject, resource, "create");
}

export function canEdit(subject: AccessSubject, resource: RbacResource): boolean {
  return can(subject, resource, "edit");
}

export function canDelete(subject: AccessSubject, resource: RbacResource): boolean {
  return can(subject, resource, "delete");
}

export function canApprove(subject: AccessSubject, resource: RbacResource): boolean {
  return can(subject, resource, "approve");
}

export function can(subject: AccessSubject, resource: RbacResource, action: RbacAction): boolean {
  if (subject.user.status !== "active") {
    return false;
  }

  if (subject.user.tenantId !== subject.tenantId && subject.user.role !== "Platform Admin") {
    return false;
  }

  return rolePermissions[subject.user.role][resource]?.includes(action) ?? false;
}

export function permissionsForRole(role: RoleName, tenantId: string): Role {
  const resourcePermissions = rolePermissions[role];
  const permissions = Object.entries(resourcePermissions).flatMap(([resource, actions]) =>
    (actions ?? []).map((action) => ({
      id: `${role.toLowerCase().replaceAll(" ", "-")}_${resource}_${action}`,
      action,
      resource,
      description: `${role} can ${action} ${resource}.`,
    })),
  );

  return {
    id: `${tenantId}_${role.toLowerCase().replaceAll(" ", "_")}`,
    tenantId,
    name: role,
    description: `${role} access profile for Zig tenant operations.`,
    permissions,
  };
}
