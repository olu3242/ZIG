import { PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";

export default async function LearningPage() {
  const { context } = await requireTenantContext();
  const learningPaths = await getZigServices().learning.findMany(context);

  return (
    <>
      <PageHeader
        eyebrow="Learning OS"
        title="Learning Center"
        description="Enablement shell for learning paths, courses, labs, and assessments tied to governance work."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Learning Paths" value={learningPaths.length} detail="Structured governance journeys." />
        <StatCard label="Courses" value="0" detail="Courses load from the learning service." />
        <StatCard label="Labs" value="0" detail="Labs load from the learning service." />
        <StatCard label="Assessments" value="0" detail="Assessments load from the learning service." />
      </div>
      <Section title="Learning Paths">
        <div className="grid gap-3 md:grid-cols-2">
          {learningPaths.length === 0 ? (
            <p className="text-sm text-[var(--zig-ink-muted)]">No learning paths have been assigned to this tenant.</p>
          ) : learningPaths.map((path) => (
            <article key={path.id} className="rounded-md border border-[var(--zig-border)] p-4">
              <h2 className="font-display text-lg font-semibold">{path.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--zig-ink-muted)]">{path.description}</p>
              <p className="mt-3 font-mono text-xs uppercase text-[var(--zig-teal)]">{path.progressPercent}% complete</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
