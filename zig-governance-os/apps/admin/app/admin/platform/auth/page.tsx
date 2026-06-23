import { requirePlatformOwner } from "../../guard";

const requiredEnvironment = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const blockedPlaceholders = [
  ["your_project", "supabase.co"].join("."),
  ["your", "anon-key"].join("-"),
];

export default async function PlatformAuthHealthPage() {
  await requirePlatformOwner();
  const checks = requiredEnvironment.map((name) => ({ name, status: getEnvironmentStatus(name) }));
  const ready = checks.every((check) => check.status === "configured");

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <section className="mx-auto grid max-w-5xl gap-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-blue-300/80">Platform Auth</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Authentication Health</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Runtime readiness for Supabase email authentication, Google OAuth, session bridging, and auth audit capture.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <HealthCard label="Runtime" value={ready ? "Ready" : "Needs configuration"} tone={ready ? "good" : "warn"} />
          <HealthCard label="OAuth Callback" value="/oauth/callback" tone="neutral" />
          <HealthCard label="Profile Store" value="profiles" tone="neutral" />
          <HealthCard label="Audit Store" value="auth_events" tone="neutral" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-5 py-4">Environment Variable</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.name} className="border-b border-zinc-800/70 last:border-0">
                  <td className="px-5 py-4 font-mono text-zinc-200">{check.name}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={check.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function HealthCard({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "neutral" }) {
  const toneClass = tone === "good" ? "text-emerald-300" : tone === "warn" ? "text-amber-300" : "text-blue-300";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className={`mt-3 text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "configured" | "missing" | "placeholder" }) {
  const className = status === "configured"
    ? "border-emerald-500/30 bg-emerald-950/35 text-emerald-200"
    : status === "placeholder"
      ? "border-red-500/30 bg-red-950/35 text-red-200"
      : "border-amber-500/30 bg-amber-950/35 text-amber-200";

  return (
    <span className={`rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-[0.14em] ${className}`}>
      {status}
    </span>
  );
}

function getEnvironmentStatus(name: string): "configured" | "missing" | "placeholder" {
  const value = process.env[name];
  if (!value) {
    return "missing";
  }
  if (blockedPlaceholders.some((placeholder) => value.includes(placeholder))) {
    return "placeholder";
  }
  return "configured";
}
