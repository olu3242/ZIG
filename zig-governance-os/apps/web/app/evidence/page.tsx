import { EvidenceManagementEngine } from "@zig/evidence";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function EvidencePage() {
  await requireTenantContext();
  const health = new EvidenceManagementEngine().health({ exists: true, reviewStatus: "approved", expiresAt: new Date(Date.now() + 30 * 86400000) });

  return (
    <>
      <PageHeader eyebrow="Evidence" title="Evidence Management" description="Evidence ownership, review, approval, expiration, collection, and source-health tracking." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Evidence Health" value={health.replaceAll("_", " ")} detail="Current, expired, missing, pending review, rejected, approved." tone="healthy" />
        <StatCard label="Sources" value="6" detail="Manual upload, automation, API, cloud sync, import, and generated evidence." />
        <StatCard label="Review Workflow" value="Ready" detail="Owner, reviewer, approval, and expiration lifecycle." />
      </div>
      <Section title="Evidence Sources">
        <DataTable
          columns={["Source", "Collection Path", "Status"]}
          empty="No evidence sources configured."
          rows={[
            ["Manual Upload", "User-submitted files and links", <StatusBadge key="manual" tone="success">ready</StatusBadge>],
            ["Automation", "Workflow-generated evidence", <StatusBadge key="automation" tone="success">ready</StatusBadge>],
            ["API Integration", "Integration-sourced artifacts", <StatusBadge key="api" tone="success">ready</StatusBadge>],
          ]}
        />
      </Section>
    </>
  );
}
