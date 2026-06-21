import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { loadCreateLifecycleMetrics } from "@/app/lib/lifecycle";

export default async function MissionControlPage() {
  const { context } = await requireTenantContext();
  const metrics = await loadCreateLifecycleMetrics(context.tenantId);

  return (
    <>
      <PageHeader
        eyebrow="CREATE / Mission Control"
        title="Mission Control"
        description="Live CREATE certification view for projects, assets, controls, relationships, activity, and the initial governance score."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Governance Score V1" value={`${metrics.score}%`} detail="20 project + 30 assets + 30 controls + 20 relationships." tone={metrics.score >= 80 ? "healthy" : "attention"} />
        <StatCard label="Projects" value={metrics.activeProjects.length} detail="Active tenant-scoped governance programs." />
        <StatCard label="Assets" value={metrics.activeAssets.length} detail="Active inventory records feeding assessment." />
        <StatCard label="Controls" value={metrics.activeControls.length} detail="Active controls available for mapping." />
        <StatCard label="Relationships" value={metrics.mappings.length} detail="Asset-control protection links." tone={metrics.mappings.length > 0 ? "healthy" : "attention"} />
        <StatCard label="Recent Activity" value={metrics.activities.length} detail="Latest CREATE audit events." />
        <StatCard label="CREATE Gate" value={metrics.score >= 100 ? "Ready" : "Open"} detail="Gate requires project, asset, control, and relationship." tone={metrics.score >= 100 ? "healthy" : "attention"} />
        <StatCard label="Next Stage" value="ASSESS" detail="Locked until CREATE certification passes." />
      </div>
      <Section title="CREATE Workflow">
        <DataTable
          columns={["Workflow", "Route", "Certification Signal"]}
          empty="Create a project to start CREATE certification."
          rows={[
            ["Create Project", <Link key="project" href="/projects/new" className="underline underline-offset-4">/projects/new</Link>, metrics.activeProjects.length > 0 ? "present" : "missing"],
            ["Create Asset", <Link key="assets" href="/assets" className="underline underline-offset-4">/assets</Link>, metrics.activeAssets.length > 0 ? "present" : "missing"],
            ["Create Control", <Link key="controls" href="/controls" className="underline underline-offset-4">/controls</Link>, metrics.activeControls.length > 0 ? "present" : "missing"],
            ["Link Asset to Control", <Link key="relationships" href={metrics.activeProjects[0] ? `/projects/${metrics.activeProjects[0].projectId}` : "/projects/new"} className="underline underline-offset-4">Project Workspace</Link>, metrics.mappings.length > 0 ? "present" : "missing"],
          ]}
        />
      </Section>
      <Section title="Recent CREATE Activity">
        <DataTable
          columns={["Stage", "Action", "Entity", "When"]}
          empty="No CREATE activity has been logged yet."
          rows={metrics.activities.map((activity) => [
            activity.lifecycleStage,
            activity.action,
            activity.entityType,
            new Date(activity.createdAt).toLocaleString(),
          ])}
        />
      </Section>
    </>
  );
}
