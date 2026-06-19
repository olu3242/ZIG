import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { learningModules, learningPaths, lessons } from "@/app/lib/mvp-data";

export default async function LearningModulePage({ params }: { params: Promise<{ id: string }> }) {
  await requireTenantContext();
  const { id } = await params;
  const learningModule = learningModules.find((item) => item.id === id) ?? learningModules[0];
  const path = learningPaths.find((item) => item.id === learningModule.pathId) ?? learningPaths[0];
  const moduleLessons = lessons.filter((lesson) => lesson.moduleId === learningModule.id);

  return (
    <>
      <PageHeader eyebrow={path.title} title={learningModule.title} description={learningModule.objective} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Lessons" value={moduleLessons.length} detail="Lesson player items in this module." />
        <StatCard label="Estimated Time" value={`${moduleLessons.reduce((sum, lesson) => sum + lesson.duration, 0)}m`} detail="Total guided runtime." />
        <StatCard label="Progress" value={`${path.progress}%`} detail="Path-level completion signal." tone="healthy" />
      </div>
      <Section title="Lessons">
        <DataTable
          columns={["Lesson", "Duration", "Outcome", "Status"]}
          empty="No lessons configured."
          rows={moduleLessons.map((lesson, index) => [
            <Link key={lesson.id} href={`/learning/lesson/${lesson.id}`} className="font-medium underline underline-offset-4">{lesson.title}</Link>,
            `${lesson.duration}m`,
            lesson.outcome,
            <StatusBadge key={`${lesson.id}-status`} tone={index === 0 ? "success" : "neutral"}>{index === 0 ? "ready" : "locked"}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
