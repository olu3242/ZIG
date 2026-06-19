import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";

export default async function AssessmentListPage() {
  const { context } = await requireTenantContext();
  const services = getZigServices();

  const assessments = await services.assessments.findMany(context);
  const summary = await services.assessments.getLearnerAssessmentSummary(context);

  return (
    <>
      <PageHeader
        eyebrow="Assessments"
        title="Assessment Center"
        description="Launch an assessment, answer real questions, and submit for scoring against stored correct answers."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Attempts" value={summary.attemptCount} detail="Submitted assessment attempts." />
        <StatCard label="Passed" value={summary.passedCount} detail="Attempts that met the passing score." tone="healthy" />
        <StatCard
          label="Latest Score"
          value={summary.latestScore === null ? "—" : `${summary.latestScore}%`}
          detail="Most recent submitted attempt."
        />
      </div>
      <Section title="Available Assessments">
        <DataTable
          columns={["Title", "Type", "Passing Score", "Action"]}
          empty="No assessments have been defined for this tenant."
          rows={assessments.map((assessment) => [
            assessment.title,
            assessment.assessmentType,
            `${assessment.passingScore}%`,
            <Link key={assessment.id} href={`/assessment/${assessment.id}`} className="font-medium underline underline-offset-4">
              Launch assessment
            </Link>,
          ])}
        />
      </Section>
    </>
  );
}
