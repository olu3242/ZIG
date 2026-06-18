import { IntegrationRegistry } from "@zig/integrations";
import { requirePlatformOwner } from "../guard";

export default async function AdminIntegrationsPage() {
  await requirePlatformOwner();
  const providers = new IntegrationRegistry().list();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">Integration Health Dashboard</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Providers" value={providers.length} />
        <Metric label="OAuth Ready" value={providers.filter((provider) => provider.supportsOAuth).length} />
        <Metric label="Webhook Ready" value={providers.filter((provider) => provider.supportsWebhooks).length} />
        <Metric label="Categories" value={9} />
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded border p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>;
}
