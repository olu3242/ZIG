import { notFound } from "next/navigation";
import { DataTable, PageHeader, Section, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { runHealthAdvisorAction } from "@/app/lib/actions";
import { getZigServices } from "@/app/lib/supabase";

const SEVERITY_TONE: Record<string, "neutral" | "success" | "warning"> = {
  critical: "warning",
  high: "warning",
  medium: "neutral",
  info: "neutral",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const project = await services.projects.findById(context, id);

  if (!project) {
    notFound();
  }

  const framework = await services.frameworks.findById(context, project.frameworkId);
  const recommendations = await services.governance.findRecommendations(context, id);
  const scoreHistory = await services.governance.getScoreHistory(context, id);
  const rankedRecommendations = [...recommendations].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  return (
    <>
      <PageHeader
        eyebrow="Project Detail"
        title={project.name}
        description={`${project.industry ?? "Unassigned"} governance project mapped to ${framework?.name ?? "selected framework"}.`}
        actions={<StatusBadge tone="success">{project.status}</StatusBadge>}
      />
      <Section title="Project Context">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div><dt className="font-medium">Framework</dt><dd className="text-[var(--zig-ink-muted)]">{framework?.name ?? project.frameworkId}</dd></div>
          <div><dt className="font-medium">Industry</dt><dd className="text-[var(--zig-ink-muted)]">{project.industry ?? "Unassigned"}</dd></div>
          <div><dt className="font-medium">Tenant ID</dt><dd className="font-mono text-[var(--zig-ink-muted)]">{project.tenantId}</dd></div>
          <div><dt className="font-medium">Project ID</dt><dd className="font-mono text-[var(--zig-ink-muted)]">{project.id}</dd></div>
        </dl>
      </Section>
      <Section
        title="Health Advisor"
        action={
          <form action={runHealthAdvisorAction}>
            <input type="hidden" name="projectId" value={id} />
            <button type="submit" className="rounded-md bg-[var(--zig-ink)] px-3 py-1.5 text-sm font-medium text-white">
              Run Health Advisor
            </button>
          </form>
        }
      >
        <DataTable
          columns={["Severity", "Recommendation", "Action", "Framework"]}
          empty="No recommendations yet — run the Health Advisor to generate gap-based recommendations from the live governance score."
          rows={rankedRecommendations.map((recommendation) => [
            <StatusBadge key={`${recommendation.id}-severity`} tone={SEVERITY_TONE[recommendation.severity] ?? "neutral"}>
              {recommendation.severity}
            </StatusBadge>,
            recommendation.title,
            recommendation.action,
            recommendation.frameworkReference ?? "—",
          ])}
        />
      </Section>
      <Section title="Score History">
        <DataTable
          columns={["Recorded", "Score", "Health State", "Explanation"]}
          empty="No score snapshots yet — running the Health Advisor also records one."
          rows={scoreHistory.map((snapshot) => [
            snapshot.calculatedAt.toLocaleString(),
            String(snapshot.score),
            snapshot.healthState,
            snapshot.explanation,
          ])}
        />
      </Section>
    </>
  );
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, info: 3 };
