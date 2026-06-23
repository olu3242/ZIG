import Link from "next/link";
import { notFound } from "next/navigation";
import { DataTable, FormField, PageHeader, Section, SelectField, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import {
  archiveAssetAction,
  archiveControlAction,
  archiveProjectAction,
  createAssetAction,
  createControlAction,
  linkAssetControlAction,
  updateAssetAction,
  updateControlAction,
  updateProjectAction,
} from "@/app/lib/actions";
import { calculateCreateGovernanceScore, getLifecycleProject } from "@/app/lib/lifecycle";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context } = await requireTenantContext();
  const workspace = await getLifecycleProject(context.tenantId, id);

  if (!workspace) {
    notFound();
  }

  const { project, assets, controls, mappings, activities } = workspace;
  const activeAssets = assets.filter((asset) => asset.status !== "archived");
  const activeControls = controls.filter((control) => control.status !== "archived");
  const createScore = calculateCreateGovernanceScore({
    projectCount: project.status === "archived" ? 0 : 1,
    assetCount: activeAssets.length,
    controlCount: activeControls.length,
    relationshipCount: mappings.length,
  });

  return (
    <>
      <PageHeader
        eyebrow="CREATE / Project Workspace"
        title={project.name}
        description={project.description || `${project.industry} governance program focused on ${project.frameworkName ?? project.frameworkFocus}.`}
        actions={(
          <>
            <StatusBadge tone={project.status === "active" ? "success" : "warning"}>{project.status}</StatusBadge>
            <form action={archiveProjectAction}>
              <input type="hidden" name="projectId" value={project.projectId} />
              <button className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm font-medium">Archive Project</button>
            </form>
          </>
        )}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="CREATE Score" value={`${createScore}%`} detail="20 project + 30 assets + 30 controls + 20 relationships." tone={createScore >= 80 ? "healthy" : "attention"} />
        <StatCard label="Assets" value={activeAssets.length} detail="Active inventory records linked to this project." />
        <StatCard label="Controls" value={activeControls.length} detail="Active operational controls linked to this project." />
        <StatCard label="Relationships" value={mappings.length} detail="Asset-control protection links." tone={mappings.length > 0 ? "healthy" : "attention"} />
      </div>

      <Section title="Project Overview">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div><dt className="font-medium">Industry</dt><dd className="text-[var(--zig-ink-muted)]">{project.industry}</dd></div>
          <div><dt className="font-medium">Lifecycle Stage</dt><dd className="text-[var(--zig-ink-muted)]">CREATE</dd></div>
          <div><dt className="font-medium">Framework Focus</dt><dd className="text-[var(--zig-ink-muted)]">{project.frameworkName ?? project.frameworkFocus}</dd></div>
          <div><dt className="font-medium">Project ID</dt><dd className="font-mono text-[var(--zig-ink-muted)]">{project.projectId}</dd></div>
        </dl>
      </Section>

      <Section title="Edit Project">
        <form action={updateProjectAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="projectId" value={project.projectId} />
          <FormField label="Project name" name="name" defaultValue={project.name} required />
          <FormField label="Industry" name="industry" defaultValue={project.industry} required />
          <SelectField label="Status" name="status" required options={["draft", "active", "paused", "archived"].map((value) => ({ label: value, value }))} />
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            <span>Description</span>
            <textarea className="min-h-24 rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] px-3 py-2 text-[var(--zig-ink)]" name="description" defaultValue={project.description} />
          </label>
          <button className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm font-medium md:w-fit">Update Project</button>
        </form>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Add Asset">
          <form action={createAssetAction} className="grid gap-4">
            <input type="hidden" name="projectId" value={project.projectId} />
            <FormField label="Asset name" name="name" required />
            <SelectField label="Type" name="assetType" required options={["Application", "Data Store", "Business Process", "Vendor System", "Infrastructure"].map((value) => ({ label: value, value }))} />
            <SelectField label="Classification" name="classification" required options={["public", "internal", "confidential", "restricted"].map((value) => ({ label: value, value }))} />
            <SelectField label="Criticality" name="criticality" required options={["low", "medium", "high", "critical"].map((value) => ({ label: value, value }))} />
            <label className="grid gap-2 text-sm font-medium">
              <span>Description</span>
              <textarea className="min-h-24 rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] px-3 py-2 text-[var(--zig-ink)]" name="description" />
            </label>
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Create Asset</button>
          </form>
        </Section>

        <Section title="Add Control">
          <form action={createControlAction} className="grid gap-4">
            <input type="hidden" name="projectId" value={project.projectId} />
            <FormField label="Control name" name="name" required />
            <SelectField label="Status" name="status" required options={["draft", "implemented", "active", "monitored"].map((value) => ({ label: value, value }))} />
            <FormField label="Effectiveness" name="effectiveness" type="number" defaultValue="50" required />
            <label className="grid gap-2 text-sm font-medium">
              <span>Description</span>
              <textarea className="min-h-24 rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] px-3 py-2 text-[var(--zig-ink)]" name="description" />
            </label>
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Create Control</button>
          </form>
        </Section>
      </div>

      <Section title="Link Control to Asset">
        <form action={linkAssetControlAction} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <input type="hidden" name="projectId" value={project.projectId} />
          <SelectField
            label="Asset"
            name="assetId"
            required
            options={activeAssets.map((asset) => ({ label: asset.name, value: asset.assetId }))}
          />
          <SelectField
            label="Control"
            name="controlId"
            required
            options={activeControls.map((control) => ({ label: control.name, value: control.controlId }))}
          />
          <SelectField
            label="Relationship"
            name="relationshipType"
            required
            options={["protects", "monitors", "detects", "recovers"].map((value) => ({ label: value, value }))}
          />
          <button
            className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={activeAssets.length === 0 || activeControls.length === 0}
          >
            Link
          </button>
        </form>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Edit Asset">
          <form action={updateAssetAction} className="grid gap-4">
            <input type="hidden" name="projectId" value={project.projectId} />
            <SelectField label="Asset" name="assetId" required options={assets.map((asset) => ({ label: asset.name, value: asset.assetId }))} />
            <FormField label="New asset name" name="name" required />
            <SelectField label="Type" name="assetType" required options={["Application", "Data Store", "Business Process", "Vendor System", "Infrastructure"].map((value) => ({ label: value, value }))} />
            <SelectField label="Classification" name="classification" required options={["public", "internal", "confidential", "restricted"].map((value) => ({ label: value, value }))} />
            <SelectField label="Criticality" name="criticality" required options={["low", "medium", "high", "critical"].map((value) => ({ label: value, value }))} />
            <SelectField label="Status" name="status" required options={["active", "archived"].map((value) => ({ label: value, value }))} />
            <label className="grid gap-2 text-sm font-medium">
              <span>Description</span>
              <textarea className="min-h-24 rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] px-3 py-2 text-[var(--zig-ink)]" name="description" />
            </label>
            <button className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50" disabled={assets.length === 0}>Update Asset</button>
          </form>
        </Section>

        <Section title="Edit Control">
          <form action={updateControlAction} className="grid gap-4">
            <input type="hidden" name="projectId" value={project.projectId} />
            <SelectField label="Control" name="controlId" required options={controls.map((control) => ({ label: control.name, value: control.controlId }))} />
            <FormField label="New control name" name="name" required />
            <SelectField label="Status" name="status" required options={["draft", "implemented", "active", "monitored", "archived"].map((value) => ({ label: value, value }))} />
            <FormField label="Effectiveness" name="effectiveness" type="number" defaultValue="50" required />
            <label className="grid gap-2 text-sm font-medium">
              <span>Description</span>
              <textarea className="min-h-24 rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] px-3 py-2 text-[var(--zig-ink)]" name="description" />
            </label>
            <button className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50" disabled={controls.length === 0}>Update Control</button>
          </form>
        </Section>
      </div>

      <Section title="Asset Inventory">
        <DataTable
          columns={["Asset", "Type", "Classification", "Criticality", "Linked Controls", "Status", "Action"]}
          empty="No assets yet. Add the first asset to connect CREATE to ASSESS."
          rows={assets.map((asset) => [
            asset.name,
            asset.assetType,
            asset.classification,
            asset.criticality,
            mappings.filter((mapping) => mapping.assetId === asset.assetId).length,
            <StatusBadge key={`${asset.assetId}-status`} tone={asset.status === "active" ? "success" : "warning"}>{asset.status}</StatusBadge>,
            <form key={`${asset.assetId}-archive`} action={archiveAssetAction}>
              <input type="hidden" name="projectId" value={project.projectId} />
              <input type="hidden" name="assetId" value={asset.assetId} />
              <button className="rounded-md border border-[var(--zig-border)] px-2 py-1 text-xs">Archive</button>
            </form>,
          ])}
        />
      </Section>

      <Section title="Control Library">
        <DataTable
          columns={["Control", "Status", "Effectiveness", "Protected Assets", "Description", "Action"]}
          empty="No controls yet. Add the first control to establish operational coverage."
          rows={controls.map((control) => [
            control.name,
            <StatusBadge key={`${control.controlId}-status`} tone={control.status === "active" || control.status === "monitored" ? "success" : "warning"}>{control.status}</StatusBadge>,
            `${control.effectiveness}%`,
            mappings.filter((mapping) => mapping.controlId === control.controlId).length,
            control.description || "No description",
            <form key={`${control.controlId}-archive`} action={archiveControlAction}>
              <input type="hidden" name="projectId" value={project.projectId} />
              <input type="hidden" name="controlId" value={control.controlId} />
              <button className="rounded-md border border-[var(--zig-border)] px-2 py-1 text-xs">Archive</button>
            </form>,
          ])}
        />
      </Section>

      <Section title="Asset-Control Relationships">
        <DataTable
          columns={["Asset", "Control", "Relationship", "Created"]}
          empty="No relationships yet. Link a control to an asset to complete CREATE certification."
          rows={mappings.map((mapping) => [
            assets.find((asset) => asset.assetId === mapping.assetId)?.name ?? mapping.assetId,
            controls.find((control) => control.controlId === mapping.controlId)?.name ?? mapping.controlId,
            mapping.relationshipType,
            new Date(mapping.createdAt).toLocaleString(),
          ])}
        />
      </Section>

      <Section title="Recent CREATE Activity">
        <DataTable
          columns={["Stage", "Action", "Entity", "When"]}
          empty="No lifecycle activity yet."
          rows={activities.map((activity) => [activity.lifecycleStage, activity.action, activity.entityType, new Date(activity.createdAt).toLocaleString()])}
        />
      </Section>

      <div className="flex justify-end">
        <Link className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm font-medium" href="/projects">Back to Projects</Link>
      </div>
    </>
  );
}
