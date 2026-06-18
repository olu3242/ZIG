import { notFound } from "next/navigation";
import { PageHeader, Section, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const project = await services.projects.findById(context, id);

  if (!project) {
    notFound();
  }

  const framework = await services.frameworks.findById(context, project.frameworkId);

  return (
    <>
      <PageHeader
        eyebrow="Project Detail"
        title={project.name}
        description={`${project.industry ?? "Unassigned"} governance project mapped to ${framework?.name ?? "selected framework"}.`}
        actions={<StatusBadge tone="success">{project.status}</StatusBadge>}
      />
      <Section title="Project Context">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div><dt className="font-medium">Framework</dt><dd className="text-[var(--zig-ink-muted)]">{framework?.name ?? project.frameworkId}</dd></div>
          <div><dt className="font-medium">Industry</dt><dd className="text-[var(--zig-ink-muted)]">{project.industry ?? "Unassigned"}</dd></div>
          <div><dt className="font-medium">Tenant ID</dt><dd className="font-mono text-[var(--zig-ink-muted)]">{project.tenantId}</dd></div>
          <div><dt className="font-medium">Project ID</dt><dd className="font-mono text-[var(--zig-ink-muted)]">{project.id}</dd></div>
        </dl>
      </Section>
    </>
  );
}
