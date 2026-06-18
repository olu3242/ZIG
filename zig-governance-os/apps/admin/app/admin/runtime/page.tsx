import { requirePlatformOwner } from "../guard";
import { loadPlatformRuntime } from "../../lib/platform-data";

export default async function AdminRuntimePage() {
  await requirePlatformOwner();
  const runtime = await loadPlatformRuntime();

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">Runtime Operations</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Tenants" value={runtime.tenantCount} />
        <Metric label="Active Tenants" value={runtime.activeTenantCount} />
        <Metric label="Users" value={runtime.userCount} />
        <Metric label="Recent Audit Events" value={runtime.auditEventCount} />
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border p-4">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
