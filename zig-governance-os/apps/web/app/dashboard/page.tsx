import Link from "next/link";
import { DataTable, GovernanceScoreWidget, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { loadDashboard } from "@/app/lib/data";

const quickActions = [
  ["Create Project", "/projects/new"],
  ["Asset Inventory", "/assets"],
  ["Control Library", "/controls"],
  ["Mission Control", "/mission-control"],
] as const;

export default async function DashboardPage() {
  const { tenant, persona, projects, frameworks, stats } = await loadDashboard();

  return (
    <>
      <PageHeader
        eyebrow="Mission Control"
        title="Zig Dashboard"
        description={`Tenant-scoped operating view for ${tenant?.name ?? "your workspace"} with persona ${persona}.`}
      />

      {stats.resilientMode === "starter" ? (
        <section className="rounded-lg border border-[var(--zig-border)] bg-[var(--zig-paper-2)] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--zig-teal)]">Welcome to ZIG</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Let&apos;s get started</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--zig-ink-muted)]">
            Your session is active. Zig could not load all workspace records yet, so this starter dashboard keeps the platform usable while profile,
            organization, learning, framework, and certification records are repaired.
          </p>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GovernanceScoreWidget score={stats.governanceScore} detail="CREATE score: 20 project + 30 assets + 30 controls + 20 relationships." />
        <StatCard label="Projects" value={stats.projectCount} detail={`${stats.activeProjects} active governance project(s).`} tone="healthy" />
        <StatCard label="Assets" value={stats.assetCount} detail="Active assets in CREATE inventory." tone={stats.assetCount > 0 ? "healthy" : "attention"} />
        <StatCard label="Controls" value={stats.controlCount} detail="Active controls in CREATE library." tone={stats.controlCount > 0 ? "healthy" : "attention"} />
        <StatCard label="Relationships" value={stats.relationshipCount} detail="Asset-control mappings required for certification." tone={stats.relationshipCount > 0 ? "healthy" : "attention"} />
        <StatCard label="Activity" value={stats.recentActivityCount} detail="Recent CREATE lifecycle audit events." />
        <StatCard label="Frameworks" value={stats.frameworkCount} detail="Available metadata for project focus only." />
        <StatCard label="CREATE Gate" value={stats.onboardingState} detail="ASSESS remains locked until CREATE is certified." />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Projects">
          <DataTable
            columns={["Project", "Framework", "Status"]}
            empty="Create a project to activate the governance dashboard."
            rows={projects.map((project) => [
              <Link key={project.id} href={`/projects/${project.id}`} className="font-medium underline underline-offset-4">{project.name}</Link>,
              frameworks.find((framework) => framework.id === project.frameworkId)?.name ?? project.frameworkId,
              <StatusBadge key={`${project.id}-status`} tone="success">{project.status}</StatusBadge>,
            ])}
          />
        </Section>

        <Section title="Quick Actions">
          <div className="grid gap-2">
            {quickActions.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm font-medium hover:border-[var(--zig-ink)]">
                {label}
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
