import { AgentOperatingSystem } from "@zig/agents";
import { requirePlatformOwner } from "@/app/admin/guard";

export default async function AdminAgentsPage() {
  await requirePlatformOwner();
  const agents = new AgentOperatingSystem().listAgents();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-zinc-950 px-6 py-10 text-white">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-blue-300">Platform Owner</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Agent Runtime Oversight</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
          Platform-level inventory for the autonomous GRC workforce. Agents remain permission-scoped, approval-gated, and audit-ready.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Registered Agents" value={agents.length} />
        <Metric label="Default Approval Mode" value="Human" />
        <Metric label="Runtime Boundary" value="Tenant Scoped" />
      </section>

      <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-950 font-mono text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Mission</th>
              <th className="px-4 py-3">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.key} className="border-t border-zinc-800">
                <td className="px-4 py-4 font-medium">{agent.name}</td>
                <td className="px-4 py-4 text-zinc-400">{agent.mission}</td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-500">{agent.permissions.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-xl">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold">{value}</p>
    </article>
  );
}
