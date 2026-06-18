import Link from "next/link";
import { PageHeader, Section, StatCard } from "@zig/ui";
import { dashboardStats, governanceScore, recommendations, tasks } from "@/app/lib/mock-data";

const quickActions = [
  ["Create Project", "/projects/new"],
  ["Framework Library", "/frameworks"],
  ["Learning Center", "/learning"],
  ["Scenario Lab", "/scenarios"],
  ["AI Coach", "/ai-command"],
] as const;

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mission Control"
        title="Zig Dashboard"
        description="A populated project-level view of governance health, work in flight, framework coverage, learning progress, and next actions."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Governance Health Score" value={governanceScore.score} detail={governanceScore.explanation} tone="attention" />
        <StatCard label="Projects" value={dashboardStats.projects} detail="Active and draft governance initiatives." tone="healthy" />
        <StatCard label="Frameworks" value={dashboardStats.frameworks} detail="Metadata-backed framework registry." />
        <StatCard label="Learning Progress" value={dashboardStats.learningProgress} detail="Current practitioner enablement progress." />
        <StatCard label="Open Risks" value={dashboardStats.openRisks} detail="Risks requiring treatment or owner review." tone="attention" />
        <StatCard label="Open Tasks" value={dashboardStats.openTasks} detail="Action items generated from gaps." tone="attention" />
        <StatCard label="Evidence Status" value={dashboardStats.evidenceStatus} detail="Controls with accepted or submitted evidence." />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Health Advisor Recommendations">
          <div className="grid gap-3">
            {recommendations.map((recommendation) => (
              <article key={recommendation.id} className="rounded-md border border-[var(--zig-border)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[var(--zig-amber)] px-2 py-1 font-mono text-xs uppercase text-[var(--zig-ink)]">
                    {recommendation.severity}
                  </span>
                  <span className="font-mono text-xs text-[var(--zig-ink-muted)]">{recommendation.frameworkReference}</span>
                </div>
                <h2 className="mt-3 font-display text-lg font-semibold">{recommendation.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--zig-ink-muted)]">{recommendation.explanation}</p>
                <p className="mt-2 text-sm font-medium">{recommendation.action}</p>
              </article>
            ))}
          </div>
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

      <Section title="Open Tasks">
        <div className="grid gap-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-col gap-1 rounded-md border border-[var(--zig-border)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <span>{task.title}</span>
              <span className="font-mono text-xs uppercase text-[var(--zig-ink-muted)]">{task.status}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
