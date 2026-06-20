import Link from "next/link";
import { notFound } from "next/navigation";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { enrollAction } from "@/app/lib/actions";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";

export default async function LearningPathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context } = await requireTenantContext();
  const services = getZigServices();

  const path = await services.learning.findById(context, id);
  if (!path) {
    notFound();
  }

  const modules = await services.learning.findModules(context, id);
  const progress = await services.learning.getProgress(context, id);
  const isEnrolled = progress.status !== "not_started";

  return (
    <>
      <PageHeader
        eyebrow="Learning Path"
        title={path.title}
        description={path.description}
        actions={<StatusBadge tone={progress.status === "completed" ? "success" : "warning"}>{progress.status.replaceAll("_", " ")}</StatusBadge>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Modules" value={progress.totalModules} detail="Modules and lessons in this path." />
        <StatCard label="Completed" value={progress.completedModules} detail="Modules with a completed progress row." />
        <StatCard label="Completion" value={`${progress.completionPercent}%`} detail="Computed by the progress engine from user_progress rows." tone="healthy" />
      </div>

      {!isEnrolled ? (
        <Section title="Enroll">
          <form action={enrollAction} className="flex items-center gap-3">
            <input type="hidden" name="learningPathId" value={path.id} />
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">
              Enroll in this path
            </button>
          </form>
        </Section>
      ) : null}

      <Section title="Modules">
        <DataTable
          columns={["Module", "Type", "Duration", "Action"]}
          empty="No modules have been defined for this learning path."
          rows={modules.map((module) => [
            module.title,
            module.moduleType,
            `${module.durationMinutes} min`,
            module.moduleType === "lesson" ? (
              <Link key={module.id} href={`/learning/lesson/${module.id}`} className="font-medium underline underline-offset-4">
                Open lesson
              </Link>
            ) : (
              <Link key={module.id} href={`/learning/module/${module.id}`} className="font-medium underline underline-offset-4">
                Open module
              </Link>
            ),
          ])}
        />
      </Section>
    </>
  );
}
