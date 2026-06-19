import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

const reports = ["Learning Transcript", "Lab Transcript", "Risk Summary", "Vendor Summary", "Career Progress"];

export default async function ReportsPage() {
  await requireTenantContext();

  return (
    <>
      <PageHeader eyebrow="Reporting" title="MVP Reports" description="Generate launch-ready transcripts and summaries for learning, labs, risks, vendors, and career growth." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Reports" value={reports.length} detail="Available report templates." />
        <StatCard label="Formats" value="PDF / CSV" detail="Export targets for MVP+." tone="healthy" />
        <StatCard label="Status" value="Ready" detail="Report generation catalog is wired." />
      </div>
      <Section title="Report Catalog">
        <DataTable
          columns={["Report", "Export", "Status"]}
          empty="No reports."
          rows={reports.map((report) => [report, report.includes("Summary") ? "PDF / CSV" : "PDF", <StatusBadge key={report} tone="success">ready</StatusBadge>])}
        />
      </Section>
    </>
  );
}
