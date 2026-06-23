import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { assessments } from "@/app/lib/mvp-data";

const sampleQuestions = [
  ["Multiple Choice", "Which evidence best supports an access review control?", "Approved access review export with reviewer notes"],
  ["Multi-Select", "Select the indicators of a strong vendor assessment.", "Scope, data type, control assurance, residual risk decision"],
  ["Scenario", "A lab artifact lacks owner and due date. What is the remediation weakness?", "The action is not accountable or trackable"],
];

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTenantContext();
  const { id } = await params;
  const assessment = assessments.find((item) => item.id === id) ?? assessments[0];
  const passed = assessment.score >= assessment.passingScore;

  return (
    <>
      <PageHeader eyebrow="Assessment Attempt" title={assessment.title} description="Scenario-aware questions with scoring and certification eligibility." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Type" value={assessment.type} detail="Supported assessment mode." />
        <StatCard label="Framework" value={assessment.framework} detail="Mapped learning domain." />
        <StatCard label="Score" value={`${assessment.score}%`} detail={`Passing score: ${assessment.passingScore}%.`} tone={passed ? "healthy" : "attention"} />
        <StatCard label="Result" value={passed ? "Pass" : "Fail"} detail="Certification eligibility signal." />
      </div>
      <Section title="Question Preview">
        <DataTable columns={["Type", "Question", "Expected Answer"]} empty="No questions." rows={sampleQuestions} />
      </Section>
      <Section title="Eligibility">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--zig-ink-muted)]">
          <StatusBadge tone={passed ? "success" : "warning"}>{passed ? "certification eligible" : "retake required"}</StatusBadge>
          <Link href="/assessment" className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-[var(--zig-ink)]">Back to assessments</Link>
        </div>
      </Section>
    </>
  );
}
