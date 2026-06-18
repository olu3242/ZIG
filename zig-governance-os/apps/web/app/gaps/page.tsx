import { GapAssessmentEngine, type GapType } from "@zig/gaps";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

const gapTypes: GapType[] = ["control", "evidence", "framework", "policy", "risk", "audit"];

export default async function GapsPage() {
  await requireTenantContext();
  const engine = new GapAssessmentEngine();
  const gaps = gapTypes.map((type, index) => engine.assess(type, 40, index + 3));
  const average = Math.round(gaps.reduce((sum, gap) => sum + gap.readinessScore, 0) / gaps.length);

  return (
    <>
      <PageHeader eyebrow="Gaps" title="Gap Assessment" description="Control, evidence, framework, policy, risk, and audit gap analysis with readiness scoring." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Readiness Score" value={average} detail="0-100 readiness across all gap categories." tone={average >= 75 ? "healthy" : "attention"} />
        <StatCard label="Gap Categories" value={gapTypes.length} detail="Control, evidence, framework, policy, risk, audit." />
        <StatCard label="RAG Model" value="Ready" detail="Red, amber, green readiness bands." />
      </div>
      <Section title="Gap Outputs">
        <DataTable
          columns={["Gap Type", "Open Gaps", "Readiness"]}
          empty="No gap outputs configured."
          rows={gaps.map((gap) => [
            gap.type,
            gap.count,
            <StatusBadge key={gap.type} tone={gap.band === "green" ? "success" : gap.band === "amber" ? "warning" : "neutral"}>{gap.readinessScore}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
