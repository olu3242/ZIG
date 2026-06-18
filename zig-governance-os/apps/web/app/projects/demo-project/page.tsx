import { PageHeader, Section, StatCard } from "@zig/ui";
import { governanceScore, recommendations } from "@/app/lib/mock-data";

export default function ProjectDetailPage() {
  return (
    <>
      <PageHeader
        eyebrow="Project Detail View"
        title="SaaS Governance Launch"
        description="Mock project detail showing the connected governance chain before database-backed workspaces arrive."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Score" value={governanceScore.score} detail="Weighted by controls, evidence, risk treatment, and assessments." tone="attention" />
        <StatCard label="Assets" value="12" detail="Systems, vendors, and data stores." />
        <StatCard label="Risks" value="7" detail="Open risks linked to assets." tone="attention" />
        <StatCard label="Controls" value="28" detail="Framework-aware controls." tone="healthy" />
      </div>
      <Section title="Governance Chain">
        <div className="grid gap-2 md:grid-cols-6">
          {["Project", "Asset", "Risk", "Control", "Evidence", "Task"].map((item) => (
            <div key={item} className="rounded-md border border-[var(--zig-border)] px-3 py-4 text-center font-mono text-xs uppercase">{item}</div>
          ))}
        </div>
      </Section>
      <Section title="Next Recommendations">
        <div className="grid gap-3">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="rounded-md border border-[var(--zig-border)] p-3">
              <p className="font-medium">{recommendation.title}</p>
              <p className="mt-1 text-sm text-[var(--zig-ink-muted)]">{recommendation.action}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
