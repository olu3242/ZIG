import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { loadProjects } from "@/app/lib/data";

export default async function ProjectsPage() {
  const { projects, frameworks } = await loadProjects();
  const activeProjects = projects.filter((project) => project.status === "active").length;

  return (
    <>
      <PageHeader
        eyebrow="Guided Project Builder"
        title="Projects"
        description="Governance initiatives stay tenant-scoped and connect industry, framework, assets, risks, controls, evidence, and tasks."
        actions={<Link className="rounded-md bg-[var(--zig-amber)] px-3 py-2 font-medium text-[var(--zig-ink)]" href="/projects/new">Create Project</Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active Projects" value={activeProjects} detail="Implementation initiatives currently active." tone="healthy" />
        <StatCard label="Draft Projects" value={projects.length - activeProjects} detail="Projects waiting for activation." />
        <StatCard label="Framework Options" value={frameworks.length} detail="Registry-backed framework selections." />
      </div>
      <Section title="Project List View">
        <DataTable
          columns={["Project", "Industry", "Framework", "Status"]}
          empty="No projects exist yet. Create the first governance project."
          rows={projects.map((project) => [
            <Link key={project.id} href={`/projects/${project.id}`} className="font-medium underline underline-offset-4">{project.name}</Link>,
            project.industry ?? "Unassigned",
            frameworks.find((framework) => framework.id === project.frameworkId)?.name ?? project.frameworkId,
            <StatusBadge key={`${project.id}-status`} tone="success">{project.status}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
