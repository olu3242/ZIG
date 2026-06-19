import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { learningModules, learningPaths, lessons } from "@/app/lib/mvp-data";

export default async function LearningPathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTenantContext();
  const { id } = await params;
  const path = learningPaths.find((item) => item.id === id) ?? learningPaths[0];
  const modules = learningModules.filter((module) => module.pathId === path.id);

  return (
    <>
      <PageHeader eyebrow="Learning Path" title={path.title} description={path.description} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Completion" value={`${path.progress}%`} detail="Progress is updated as lessons are marked complete." tone={path.progress >= 50 ? "healthy" : "neutral"} />
        <StatCard label="Track" value={path.track} detail={`${path.level} path for MVP learner progression.`} />
        <StatCard label="Lessons" value={modules.reduce((count, module) => count + lessons.filter((lesson) => lesson.moduleId === module.id).length, 0)} detail="Operational lessons in this path." />
      </div>
      <Section title="Modules" action={<Link className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm" href={`/learning/module/${modules[0]?.id}`}>Resume path</Link>}>
        <DataTable
          columns={["Module", "Objective", "Status"]}
          empty="No modules configured."
          rows={modules.map((module, index) => [
            <Link key={module.id} href={`/learning/module/${module.id}`} className="font-medium underline underline-offset-4">{module.title}</Link>,
            module.objective,
            <StatusBadge key={`${module.id}-status`} tone={index === 0 ? "success" : "neutral"}>{index === 0 ? "active" : "queued"}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
