import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section, StatusBadge } from "@zig/ui";
import { submitAssessmentAction } from "@/app/lib/actions";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";

export default async function AssessmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ score?: string; passed?: string }>;
}) {
  const { id } = await params;
  const { score, passed } = await searchParams;
  const { context } = await requireTenantContext();
  const services = getZigServices();

  const found = await services.assessments.findAssessment(context, id);
  if (!found) {
    notFound();
  }
  const { assessment, questions } = found;

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title={assessment.title}
        description={`${assessment.assessmentType.replaceAll("_", " ")} • Passing score ${assessment.passingScore}%`}
        actions={score ? <StatusBadge tone={passed === "true" ? "success" : "warning"}>Last attempt: {score}%</StatusBadge> : undefined}
      />

      {questions.length === 0 ? (
        <Section title="Questions">
          <p className="text-sm text-[var(--zig-ink-muted)]">
            No questions have been defined for this assessment yet — it cannot be submitted until questions are added
            to <code>learning_assessment_questions</code>.
          </p>
        </Section>
      ) : (
        <Section title="Answer the questions">
          <form action={submitAssessmentAction} className="space-y-6">
            <input type="hidden" name="assessmentId" value={assessment.id} />
            {questions.map((question, index) => (
              <fieldset key={question.id} className="rounded-md border border-[var(--zig-border)] p-4">
                <input type="hidden" name="questionId" value={question.id} />
                <legend className="font-display text-sm font-semibold">
                  {index + 1}. {question.prompt}
                </legend>
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={`answer_${question.id}`} value={optionIndex} required />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">
              Submit assessment
            </button>
          </form>
        </Section>
      )}

      <Section title="Navigate">
        <Link href="/assessment" className="text-sm font-medium underline underline-offset-4">
          Back to assessments
        </Link>
      </Section>
    </>
  );
}
