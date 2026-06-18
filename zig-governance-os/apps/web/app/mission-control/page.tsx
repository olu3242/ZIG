import { PageHeader, Section, StatCard } from "@zig/ui";
import { loadDashboard } from "@/app/lib/data";

export default async function MissionControlPage() {
  const { stats, projects } = await loadDashboard();

  return (
    <>
      <PageHeader
        eyebrow="Mission Control"
        title="Project Command View"
        description="Single-screen operating view of score, recommendations, recent activity, and governance actions."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Governance Score" value={stats.governanceScore} detail="Current project score from the governance service path." tone="attention" />
        <StatCard label="Projects" value={projects.length} detail="Tenant-scoped projects visible to Mission Control." />
        <StatCard label="Recent Activity" value="0" detail="Audit activity appears after user actions are recorded." />
      </div>
      <Section title="Action Queue">
        <p className="text-sm text-[var(--zig-ink-muted)]">Recommendations will appear after assessments and governance score calculations create service-backed records.</p>
      </Section>
    </>
  );
}
