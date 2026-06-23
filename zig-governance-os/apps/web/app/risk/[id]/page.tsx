import Link from "next/link";
import { PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { risks, scoreRisk } from "@/app/lib/mvp-data";

export default async function RiskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTenantContext();
  const { id } = await params;
  const risk = risks.find((item) => item.id === id) ?? risks[0];
  const score = scoreRisk(risk);

  return (
    <>
      <PageHeader eyebrow="Risk Detail" title={risk.title} description="Risk score, owner, treatment, and lifecycle status." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Likelihood" value={risk.likelihood} detail="1 low, 5 high." />
        <StatCard label="Impact" value={risk.impact} detail="1 low, 5 high." />
        <StatCard label="Score" value={score} detail="Likelihood x impact." tone={score >= 15 ? "attention" : "neutral"} />
        <StatCard label="Owner" value={risk.owner} detail="Accountable risk owner." />
      </div>
      <Section title="Treatment Plan">
        <div className="grid gap-3 text-sm text-[var(--zig-ink-muted)]">
          <p><span className="font-medium text-[var(--zig-ink)]">Treatment:</span> {risk.treatment}</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Status:</span> <StatusBadge tone={risk.status === "Closed" ? "success" : "warning"}>{risk.status}</StatusBadge></p>
          <Link className="w-fit rounded-md border border-[var(--zig-border)] px-3 py-2 text-[var(--zig-ink)]" href="/risk">Back to register</Link>
        </div>
      </Section>
    </>
  );
}
