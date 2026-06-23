import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { labs } from "@/app/lib/mvp-data";

export default async function LabSessionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTenantContext();
  const { id } = await params;
  const lab = labs.find((item) => item.id === id) ?? labs[0];

  return (
    <>
      <PageHeader eyebrow="Lab Runner" title={`${lab.title} Session`} description="Generate artifacts, score deliverables, and complete the lab workflow." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Session Status" value="In Progress" detail="Lab runner state is active." />
        <StatCard label="Artifact Count" value={lab.deliverables.length} detail="Generated MVP artifact shells." tone="healthy" />
        <StatCard label="Score" value={lab.score} detail="Rubric-based score." />
      </div>
      <Section title="Generated Artifacts">
        <DataTable
          columns={["Artifact", "Export", "Status"]}
          empty="No artifacts generated."
          rows={lab.deliverables.map((deliverable) => [
            deliverable,
            "PDF / DOCX",
            <StatusBadge key={deliverable} tone="success">generated</StatusBadge>,
          ])}
        />
      </Section>
      <Section title="Performance Summary">
        <div className="grid gap-3 text-sm leading-6 text-[var(--zig-ink-muted)]">
          <p><span className="font-medium text-[var(--zig-ink)]">Pass threshold:</span> 80</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Rubric score:</span> {lab.score}</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Feedback:</span> {lab.score >= 80 ? "Strong evidence reasoning and clear executive recommendation." : "Add stronger framework mapping and more specific evidence references."}</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Coach comments:</span> Use the lab outputs to strengthen your portfolio and certification readiness.</p>
        </div>
      </Section>
    </>
  );
}
