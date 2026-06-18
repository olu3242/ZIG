import { IntegrationRegistry } from "@zig/integrations";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function IntegrationsPage() {
  await requireTenantContext();
  const providers = new IntegrationRegistry().list();

  return (
    <>
      <PageHeader
        eyebrow="Integrations"
        title="Integration Hub"
        description="Tenant connection catalog for identity, ticketing, communications, storage, source control, cloud, security, compliance, and billing."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Providers" value={providers.length} detail="MVP provider registry ready for tenant connection records." tone="healthy" />
        <StatCard label="Webhook Capable" value={providers.filter((provider) => provider.supportsWebhooks).length} detail="Inbound and outbound event wiring." />
        <StatCard label="OAuth Capable" value={providers.filter((provider) => provider.supportsOAuth).length} detail="OAuth-ready providers for connection flows." />
      </div>
      <Section title="Provider Registry">
        <DataTable
          columns={["Provider", "Category", "Webhooks"]}
          empty="No providers registered."
          rows={providers.map((provider) => [
            provider.name,
            provider.category,
            <StatusBadge key={provider.key} tone={provider.supportsWebhooks ? "success" : "neutral"}>{provider.supportsWebhooks ? "yes" : "api"}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
