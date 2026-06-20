import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { loadDashboard } from "@/app/lib/data";

export default async function MissionControlPage() {
  const { stats, projects, governance, recentActivity } = await loadDashboard();

  return (
    <>
      <PageHeader
        eyebrow="Mission Control"
        title="Project Command View"
        description="Single-screen operating view of score, recommendations, recent activity, and governance actions."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Governance Score"
          value={stats.governanceScore}
          detail={governance ? `${governance.healthState} — ${governance.explanation}` : "Create a project to generate a governance score from live data."}
          tone="attention"
        />
        <StatCard label="Projects" value={projects.length} detail="Tenant-scoped projects visible to Mission Control." />
        <StatCard label="Recent Activity" value={stats.recentActivityCount} detail="Rows persisted to audit_events for this tenant." />
      </div>
      <Section title="Recent Activity">
        <DataTable
          columns={["Action", "Entity", "When"]}
          empty="Audit activity appears after user actions are recorded."
          rows={recentActivity.map((event) => [
            event.action,
            `${event.entityTable} / ${event.entityId}`,
            event.createdAt.toLocaleString(),
          ])}
        />
      </Section>
      <Section title="Action Queue">
        <p className="text-sm text-[var(--zig-ink-muted)]">Recommendations will appear after assessments and governance score calculations create service-backed records.</p>
      </Section>
    </>
  );
}
