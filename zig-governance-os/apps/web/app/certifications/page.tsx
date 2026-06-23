import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { assessments, certifications, learningPaths } from "@/app/lib/mvp-data";

export default async function CertificationsPage() {
  await requireTenantContext();
  const eligible = assessments.filter((assessment) => assessment.score >= assessment.passingScore).length;

  return (
    <>
      <PageHeader
        eyebrow="Certification"
        title="Certification Center"
        description="Track certification pathways, eligibility signals, assessment readiness, and completion badges."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pathways" value={certifications.length} detail="Supported certification tracks." />
        <StatCard label="Eligible Assessments" value={`${eligible}/${assessments.length}`} detail="Passed assessment gates." tone="healthy" />
        <StatCard label="Learning Paths" value={learningPaths.length} detail="Mapped learning journeys." />
      </div>
      <Section title="Certification Pathways">
        <DataTable
          columns={["Certification", "Readiness", "Status"]}
          empty="No certification pathways configured."
          rows={certifications.map((certification, index) => [
            certification,
            `${Math.min(96, 62 + index * 3)}%`,
            <StatusBadge key={certification} tone={index < 3 ? "success" : "warning"}>{index < 3 ? "eligible" : "available"}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
