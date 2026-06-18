import type { ExportFormat, ExportType } from "@zig/exports";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

const exportTypes: ExportType[] = ["projects", "frameworks", "controls", "risks", "issues", "tasks", "audits", "evidence", "vendors", "users", "assets", "policies", "compliance_status", "executive_metrics"];
const formats: ExportFormat[] = ["csv", "xlsx", "json", "pdf"];

export default async function ExportsPage() {
  await requireTenantContext();

  return (
    <>
      <PageHeader
        eyebrow="Exports"
        title="Audit-Ready Export Center"
        description="Tenant-authorized exports with audit logging, download tracking, archive readiness, and portability formats."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Export Types" value={exportTypes.length} detail="Operational, audit, evidence, and executive data sets." />
        <StatCard label="Formats" value={formats.length} detail="CSV, Excel, JSON, and future PDF-ready manifests." tone="healthy" />
        <StatCard label="Audit Trail" value="Required" detail="Who, what, tenant, timestamp, format, rows, and download status." />
      </div>
      <Section title="Export Catalog">
        <DataTable
          columns={["Type", "Formats", "Audit"]}
          empty="No export types configured."
          rows={exportTypes.map((type) => [type, formats.join(", "), <StatusBadge key={type} tone="success">enabled</StatusBadge>])}
        />
      </Section>
    </>
  );
}
