import { EvidenceManagementEngine } from "@zig/evidence";
import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { evidenceTemplates } from "@/app/lib/mvp-data";

const stableEvidenceExpiry = new Date("2026-07-19T00:00:00.000Z");

export default async function EvidencePage() {
  await requireTenantContext();
  const health = new EvidenceManagementEngine().health({ exists: true, reviewStatus: "approved", expiresAt: stableEvidenceExpiry });

  return (
    <>
      <PageHeader eyebrow="Evidence" title="Evidence Management" description="Evidence ownership, review, approval, expiration, collection, and source-health tracking." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Evidence Health" value={health.replaceAll("_", " ")} detail="Current, expired, missing, pending review, rejected, approved." tone="healthy" />
        <StatCard label="Sources" value="6" detail="Manual upload, automation, API, cloud sync, import, and generated evidence." />
        <StatCard label="Templates" value={evidenceTemplates.length} detail="MVP evidence templates available." />
      </div>
      <Section title="Evidence Templates">
        <DataTable
          columns={["Evidence", "Type", "Framework", "Control", "Status"]}
          empty="No evidence templates configured."
          rows={evidenceTemplates.map((template) => [
            <Link key={template.id} href={`/evidence/${template.id}`} className="font-medium underline underline-offset-4">{template.title}</Link>,
            template.type,
            template.framework,
            template.control,
            <StatusBadge key={`${template.id}-status`} tone={template.status === "Current" ? "success" : "warning"}>{template.status}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
