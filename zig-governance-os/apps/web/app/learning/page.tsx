import { PageHeader, Section, StatCard } from "@zig/ui";
import { learningPaths } from "@/app/lib/mock-data";

export default function LearningPage() {
  return (
    <>
      <PageHeader
        eyebrow="Learning OS"
        title="Learning Center"
        description="Enablement shell for learning paths, courses, labs, and assessments tied to governance work."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Learning Paths" value={learningPaths.length} detail="Structured governance journeys." />
        <StatCard label="Courses" value="6" detail="Role-based governance courses." />
        <StatCard label="Labs" value="4" detail="Hands-on implementation labs." />
        <StatCard label="Assessments" value="3" detail="Readiness and knowledge checks." />
      </div>
      <Section title="Learning Paths">
        <div className="grid gap-3 md:grid-cols-2">
          {learningPaths.map((path) => (
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
