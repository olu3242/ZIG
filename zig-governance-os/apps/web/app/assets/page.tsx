import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { listLifecycleAssets, listLifecycleProjects } from "@/app/lib/lifecycle";

export default async function AssetsPage() {
  const { context } = await requireTenantContext();
  const [assets, projects] = await Promise.all([
    listLifecycleAssets(context.tenantId),
    listLifecycleProjects(context.tenantId),
  ]);
  const criticalAssets = assets.filter((asset) => asset.criticality === "critical" || asset.criticality === "high").length;

  return (
    <>
      <PageHeader
        eyebrow="CREATE / Asset Inventory"
        title="Assets"
        description="Assets are created inside project workspaces and become the input for risk assessment and control coverage."
        actions={<Link className="rounded-md bg-[var(--zig-amber)] px-3 py-2 font-medium text-[var(--zig-ink)]" href={projects[0] ? `/projects/${projects[0].projectId}` : "/projects/new"}>Add Asset</Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assets" value={assets.length} detail="Inventory records across active projects." />
        <StatCard label="High/Critical" value={criticalAssets} detail="Assets that should drive risk assessment." tone={criticalAssets > 0 ? "attention" : "healthy"} />
        <StatCard label="Projects" value={projects.length} detail="Governance programs with asset scope." />
      </div>
      <Section title="Asset Inventory">
        <DataTable
          columns={["Asset", "Type", "Classification", "Criticality", "Project"]}
          empty="No assets yet. Create a project, then add the first asset from the project workspace."
          rows={assets.map((asset) => [
            asset.name,
            asset.assetType,
            asset.classification,
            asset.criticality,
            projects.find((project) => project.projectId === asset.projectId)?.name ?? asset.projectId,
          ])}
        />
      </Section>
    </>
  );
}
