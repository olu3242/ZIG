export type ApiScope =
  | "tenants:read"
  | "users:read"
  | "projects:write"
  | "frameworks:read"
  | "controls:write"
  | "risks:write"
  | "audits:read"
  | "evidence:write"
  | "automation:execute"
  | "billing:read"
  | "reporting:read";

export interface ApiKeyPolicy {
  tenantId: string;
  scopes: ApiScope[];
  quotaPerHour: number;
  requestSigningRequired: boolean;
}

export const apiCategories = ["Tenants", "Users", "Projects", "Frameworks", "Controls", "Risks", "Audits", "Evidence", "Automation", "Billing", "Reporting"] as const;

export class ApiPolicyEngine {
  authorize(policy: ApiKeyPolicy, requiredScope: ApiScope): boolean {
    return policy.scopes.includes(requiredScope);
  }
}
