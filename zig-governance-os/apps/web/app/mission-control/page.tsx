import { PageHeader, Section, StatCard } from "@zig/ui";
import { governanceScore, recommendations } from "@/app/lib/mock-data";

export default function MissionControlPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mission Control"
        title="Project Command View"
        description="Single-screen operating view of score, recommendations, recent activity, and governance actions."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Governance Score" value={governanceScore.score} detail={governanceScore.explanation} tone="attention" />
        <StatCard label="Top Recommendations" value={recommendations.length} detail="Ranked Health Advisor guidance." />
        <StatCard label="Recent Activity" value="11" detail="Mock updates across tasks, controls, and evidence." />
      </div>
      <Section title="Action Queue">
        <div className="grid gap-3">
          {recommendations.map((recommendation) => (
            <article key={recommendation.id} className="rounded-md border border-[var(--zig-border)] p-4">
              <p className="font-medium">{recommendation.title}</p>
              <p className="mt-1 text-sm text-[var(--zig-ink-muted)]">{recommendation.explanation}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
