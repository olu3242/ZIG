import { DeveloperPlatform } from "@zig/developer-platform";
import { PageHeader, Section, DataTable, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function DevelopersPage() {
  await requireTenantContext();
  const platform = new DeveloperPlatform();
  const capabilities = platform.capabilities();
  const capabilityRows = Object.entries(capabilities).map(([name, enabled]) => [name, <StatusBadge key={name} tone={enabled ? "success" : "warning"}>{enabled ? "Enabled" : "Off"}</StatusBadge>]);

  return (
    <>
      <PageHeader eyebrow="Developer Platform" title="Developers" description="API keys, OAuth, OpenAPI, Swagger, Postman, SDKs, CLI, sandbox environments, and webhook management." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="SDK Targets" value={platform.sdkTargets().length} detail={platform.sdkTargets().join(", ")} />
        <StatCard label="Portal Capabilities" value={capabilityRows.length} detail="Developer platform contract." tone="healthy" />
        <StatCard label="Sandbox" value="Ready" detail="Environment-isolated design." />
      </div>
      <Section title="Developer Capabilities">
        <DataTable columns={["Capability", "Status"]} empty="No capabilities available." rows={capabilityRows} />
      </Section>
    </>
  );
}
