import { apiCategories } from "@zig/api";
import { requirePlatformOwner } from "../guard";

export default async function AdminApiPage() {
  await requirePlatformOwner();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">API Management</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Categories" value={apiCategories.length} />
        <Metric label="Security Controls" value={7} />
        <Metric label="Docs Artifacts" value={5} />
        <Metric label="Audit Required" value={1} />
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded border p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>;
}
