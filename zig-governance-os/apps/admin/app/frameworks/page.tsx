import { FrameworkIntelligenceEngine } from "@zig/frameworks";
import { requirePlatformOwner } from "../admin/guard";

export default async function AdminFrameworksPage() {
  await requirePlatformOwner();
  const frameworks = new FrameworkIntelligenceEngine().listFrameworks();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">Framework Intelligence Registry</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Frameworks" value={frameworks.length} />
        <Metric label="Framework Controls" value={frameworks.reduce((sum, item) => sum + item.controlCount, 0)} />
        <Metric label="Custom Ready" value={1} />
      </div>
      <table className="w-full border-collapse text-left text-sm">
        <thead><tr className="border-b"><th className="py-2">Framework</th><th className="py-2">Version</th><th className="py-2">Domains</th></tr></thead>
        <tbody>
          {frameworks.map((framework) => (
            <tr key={framework.code} className="border-b">
              <td className="py-2 font-medium">{framework.name}</td>
              <td className="py-2">{framework.version}</td>
              <td className="py-2">{framework.domains.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded border p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>;
}
