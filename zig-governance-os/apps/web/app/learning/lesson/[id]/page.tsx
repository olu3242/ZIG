import Link from "next/link";
import { PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { learningModules, learningPaths, lessons } from "@/app/lib/mvp-data";

export default async function LessonPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTenantContext();
  const { id } = await params;
  const lesson = lessons.find((item) => item.id === id) ?? lessons[0];
  const learningModule = learningModules.find((item) => item.id === lesson.moduleId) ?? learningModules[0];
  const path = learningPaths.find((item) => item.id === learningModule.pathId) ?? learningPaths[0];

  return (
    <>
      <PageHeader eyebrow="Lesson Player" title={lesson.title} description={lesson.outcome} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Duration" value={`${lesson.duration}m`} detail="MVP lesson runtime." />
        <StatCard label="Difficulty" value={lesson.difficulty} detail="Learner effort level." />
        <StatCard label="Framework" value={lesson.framework} detail={`${lesson.domain} / ${lesson.skill}`} />
        <StatCard label="Path Progress" value={`${path.progress}%`} detail={path.title} tone="healthy" />
      </div>
      <Section title="Lesson Brief">
        <div className="grid gap-4 text-sm leading-6 text-[var(--zig-ink-muted)]">
          <p>This lesson teaches the learner to produce a concrete GRC work product instead of memorizing terms.</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Module:</span> {learningModule.title}</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Career alignment:</span> {lesson.careerAlignment}</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Expected outcome:</span> {lesson.outcome}</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Completion criteria:</span> {lesson.completionCriteria}</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success">completion tracking ready</StatusBadge>
            <Link className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-[var(--zig-ink)]" href={`/learning/module/${learningModule.id}`}>Back to module</Link>
          </div>
        </div>
      </Section>
      <Section title="Learning Objectives">
        <ul className="grid gap-2 text-sm text-[var(--zig-ink-muted)]">
          {lesson.objectives.map((objective) => <li key={objective}>- {objective}</li>)}
        </ul>
      </Section>
      <Section title="Knowledge Check & Reflection">
        <div className="grid gap-3 text-sm leading-6 text-[var(--zig-ink-muted)]">
          <p><span className="font-medium text-[var(--zig-ink)]">Knowledge check:</span> {lesson.knowledgeCheck}</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Reflection:</span> {lesson.reflection}</p>
          <p><span className="font-medium text-[var(--zig-ink)]">Key takeaways:</span> {lesson.takeaways.join("; ")}</p>
        </div>
      </Section>
    </>
  );
}
