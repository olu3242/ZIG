import type { ExportFormat, ExportType } from "@zig/exports";
import { LIVE_EXPORT_TYPES } from "@zig/exports";
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
        <StatCard label="Live CSV Exports" value={LIVE_EXPORT_TYPES.length} detail="Wired to real, tenant-scoped repository data." tone="healthy" />
        <StatCard label="Audit Trail" value="Required" detail="Every generated export is recorded to audit_events (who, what, tenant, timestamp)." />
      </div>
      <Section title="Export Catalog">
        <DataTable
          columns={["Type", "Formats", "Status", "Download"]}
          empty="No export types configured."
          rows={exportTypes.map((type) => {
            const live = LIVE_EXPORT_TYPES.includes(type);
            return [
              type,
              live ? "csv" : formats.join(", "),
              <StatusBadge key={`${type}-status`} tone={live ? "success" : "warning"}>{live ? "live" : "catalog only"}</StatusBadge>,
              live ? (
                <a key={`${type}-download`} href={`/exports/download/${type}`} className="font-medium underline underline-offset-4">
                  Download CSV
                </a>
              ) : (
                <span key={`${type}-download`} className="text-[var(--zig-ink-muted)]">Not yet wired</span>
              ),
            ];
          })}
        />
      </Section>
    </>
  );
}
