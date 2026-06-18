import { WhiteLabelPlatform } from "@zig/whitelabel";
import { requirePlatformOwner } from "@/app/admin/guard";

export default async function WhiteLabelPage() {
  await requirePlatformOwner();
  const platform = new WhiteLabelPlatform();
  const profile = { brandName: "Partner Cloud", customDomain: "partner.example.com", tenantBranding: true, marketplaceBranding: true, learningBranding: true, customReports: true };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-zinc-950 px-6 py-10 text-white">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-blue-300">Platform Owner</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">White Label Platform</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">Custom branding, custom domains, partner portals, tenant branding, marketplace branding, learning branding, and custom reports.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Brand" value={profile.brandName} />
        <Metric label="Domain" value={profile.customDomain} />
        <Metric label="Readiness" value={platform.readiness(profile)} />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-xl">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 font-mono text-2xl font-semibold">{value}</p>
    </article>
  );
}
