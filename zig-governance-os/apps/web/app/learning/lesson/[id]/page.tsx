import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section, StatusBadge } from "@zig/ui";
import { completeLessonAction } from "@/app/lib/actions";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context } = await requireTenantContext();
  const services = getZigServices();

  const lesson = await services.learning.findModuleById(context, id);
  if (!lesson) {
    notFound();
  }

  const path = await services.learning.findById(context, lesson.learningPathId);
  const progress = await services.learning.getProgress(context, lesson.learningPathId);

  return (
    <>
      <PageHeader
        eyebrow="Lesson"
        title={lesson.title}
        description={`Part of ${path?.title ?? "a learning path"}. ${lesson.durationMinutes} minute lesson.`}
        actions={<StatusBadge tone="success">{lesson.moduleType}</StatusBadge>}
      />

      <Section title="Lesson Content">
        <p className="text-sm leading-6 text-[var(--zig-ink-muted)]">
          This lesson is part of the {path?.title ?? "learning path"} curriculum. Mark it complete once you have
          finished reviewing the material to persist your progress and update your career readiness signal.
        </p>
      </Section>

      <Section title="Mark Complete">
        <form action={completeLessonAction} className="flex items-center gap-3">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="learningPathId" value={lesson.learningPathId} />
          <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">
            Complete Lesson
          </button>
        </form>
        <p className="mt-3 text-xs text-[var(--zig-ink-muted)]">
          Current path completion: {progress.completionPercent}% ({progress.completedModules}/{progress.totalModules} modules).
        </p>
      </Section>

      <Section title="Navigate">
        <Link href={`/learning/${lesson.learningPathId}`} className="text-sm font-medium underline underline-offset-4">
          Back to learning path
        </Link>
      </Section>
    </>
  );
}
