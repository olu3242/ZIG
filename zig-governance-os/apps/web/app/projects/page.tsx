import Link from "next/link";
import { PageHeader, Section, StatCard } from "@zig/ui";
import { frameworks, projects } from "@/app/lib/mock-data";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Guided Project Builder"
        title="Projects"
        description="Governance initiatives stay tenant-scoped and connect industry, framework, assets, risks, controls, evidence, and tasks."
        actions={<Link className="rounded-md bg-[var(--zig-amber)] px-3 py-2 font-medium text-[var(--zig-ink)]" href="/projects/new">Create Project</Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active Projects" value="1" detail="One implementation initiative is currently active." tone="healthy" />
        <StatCard label="Draft Projects" value="1" detail="One generated project is ready for review." />
        <StatCard label="Framework Options" value={frameworks.length} detail="Registry-backed framework selections." />
      </div>
      <Section title="Project List View">
        <div className="grid gap-3">
          {projects.map((project) => (
            <Link key={project.id} href="/projects/demo-project" className="rounded-md border border-[var(--zig-border)] p-4 hover:border-[var(--zig-ink)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm text-[var(--zig-ink-muted)]">{project.industry} program mapped to {project.frameworkId}</p>
                </div>
                <span className="font-mono text-xs uppercase text-[var(--zig-teal)]">{project.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
