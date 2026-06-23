import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { assessments } from "@/app/lib/mvp-data";

export default async function AssessmentPage() {
  await requireTenantContext();
  const passed = assessments.filter((assessment) => assessment.score >= assessment.passingScore).length;

  return (
    <>
      <PageHeader eyebrow="Assessment" title="Knowledge Assessment Engine" description="Quizzes, scenario exams, pass/fail scoring, and certification eligibility." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assessments" value={assessments.length} detail="Multiple choice, multi-select, and scenario checks." />
        <StatCard label="Passed" value={`${passed}/${assessments.length}`} detail="Certification eligibility inputs." tone="healthy" />
        <StatCard label="Average Score" value={`${Math.round(assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length)}%`} detail="Assessment readiness." />
      </div>
      <Section title="Available Assessments">
        <DataTable
          columns={["Assessment", "Type", "Framework", "Score", "Result"]}
          empty="No assessments configured."
          rows={assessments.map((assessment) => [
            <Link key={assessment.id} href={`/assessment/${assessment.id}`} className="font-medium underline underline-offset-4">{assessment.title}</Link>,
            assessment.type,
            assessment.framework,
            `${assessment.score}%`,
            <StatusBadge key={`${assessment.id}-status`} tone={assessment.score >= assessment.passingScore ? "success" : "warning"}>{assessment.score >= assessment.passingScore ? "pass" : "fail"}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
