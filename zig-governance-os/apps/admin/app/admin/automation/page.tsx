import { triggerRegistry } from "@zig/automation";
import { requirePlatformOwner } from "../guard";

export default async function AdminAutomationPage() {
  await requirePlatformOwner();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">Automation Command Center</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Trigger Registry" value={triggerRegistry.length} />
        <Metric label="Execution Modes" value={5} />
        <Metric label="Queues" value={3} />
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded border p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>;
}
