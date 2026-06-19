import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { portfolioArtifacts, zigScore } from "@/app/lib/mvp-data";

export default async function PortfolioPage() {
  await requireTenantContext();

  return (
    <>
      <PageHeader eyebrow="Portfolio" title="Portfolio Builder" description="Automatically package proof-of-experience artifacts from labs, assessments, risk work, and vendor reviews." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Artifacts" value={portfolioArtifacts.length} detail="Generated portfolio-ready work products." tone="healthy" />
        <StatCard label="ZIG Score" value={zigScore()} detail="Learning, labs, assessments, portfolio, certifications." />
        <StatCard label="Exports" value="PDF / DOCX" detail="Portfolio package export targets." />
      </div>
      <Section title="Portfolio Artifacts">
        <DataTable
          columns={["Artifact", "Export", "Status"]}
          empty="No artifacts."
          rows={portfolioArtifacts.map((artifact) => [artifact, "PDF / DOCX / Package", <StatusBadge key={artifact} tone="success">ready</StatusBadge>])}
        />
      </Section>
    </>
  );
}
