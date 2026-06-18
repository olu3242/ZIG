import { apiCategories, ApiPolicyEngine, type ApiScope } from "@zig/api";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

const scopes: ApiScope[] = ["tenants:read", "users:read", "projects:write", "frameworks:read", "controls:write", "risks:write", "audits:read", "evidence:write", "automation:execute", "billing:read", "reporting:read"];

export default async function DeveloperPortalPage() {
  await requireTenantContext();
  const policyReady = new ApiPolicyEngine().authorize({ tenantId: "preview", scopes, quotaPerHour: 1000, requestSigningRequired: true }, "projects:write");

  return (
    <>
      <PageHeader
        eyebrow="Developer Platform"
        title="API Portal"
        description="API keys, scopes, quotas, analytics, audit logs, OpenAPI, Postman, SDK generation, and developer documentation."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="API Categories" value={apiCategories.length} detail="Tenant, user, project, GRC, automation, billing, and reporting APIs." />
        <StatCard label="Scopes" value={scopes.length} detail="RBAC and tenant-isolated service-token scope model." tone="healthy" />
        <StatCard label="Policy Engine" value={policyReady ? "Ready" : "Blocked"} detail="Validates required scope before access." />
      </div>
      <Section title="API Categories">
        <DataTable
          columns={["Category", "Security", "Audit"]}
          empty="No API categories configured."
          rows={apiCategories.map((category) => [category, "JWT, service token, API key, RBAC", <StatusBadge key={category} tone="success">logged</StatusBadge>])}
        />
      </Section>
    </>
  );
}
