import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { listLifecycleControls, listLifecycleProjects } from "@/app/lib/lifecycle";

export default async function ControlsPage() {
  const { context } = await requireTenantContext();
  const [controls, projects] = await Promise.all([
    listLifecycleControls(context.tenantId),
    listLifecycleProjects(context.tenantId),
  ]);
  const activeControls = controls.filter((control) => ["active", "monitored"].includes(control.status)).length;
  const averageEffectiveness = controls.length
    ? Math.round(controls.reduce((sum, control) => sum + control.effectiveness, 0) / controls.length)
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="CREATE / Control Library"
        title="Controls"
        description="Controls are created inside project workspaces and become the operating layer for risk reduction, evidence, and readiness."
        actions={<Link className="rounded-md bg-[var(--zig-amber)] px-3 py-2 font-medium text-[var(--zig-ink)]" href={projects[0] ? `/projects/${projects[0].projectId}` : "/projects/new"}>Add Control</Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Controls" value={controls.length} detail="Operational controls across projects." />
        <StatCard label="Active/Monitored" value={activeControls} detail="Controls ready for ASSESS." tone={activeControls > 0 ? "healthy" : "attention"} />
        <StatCard label="Effectiveness" value={`${averageEffectiveness}%`} detail="Average owner-entered effectiveness." />
      </div>
      <Section title="Operational Control Library">
        <DataTable
          columns={["Control", "Project", "Status", "Effectiveness", "Description"]}
          empty="No controls yet. Create a project, then add the first control from the project workspace."
          rows={controls.map((control) => [
            control.name,
            projects.find((project) => project.projectId === control.projectId)?.name ?? control.projectId,
            <StatusBadge key={`${control.controlId}-status`} tone={control.status === "active" || control.status === "monitored" ? "success" : "warning"}>{control.status}</StatusBadge>,
            `${control.effectiveness}%`,
            control.description || "No description",
          ])}
        />
      </Section>
    </>
  );
}
