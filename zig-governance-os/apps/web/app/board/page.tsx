import { BoardReportingEngine } from "@zig/board-reporting";
import { PageHeader, Section, DataTable, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function BoardPage() {
  await requireTenantContext();
  const reporting = new BoardReportingEngine();
  const reports = [
    reporting.manifest("board_risk", ["dashboard", "pdf"]),
    reporting.manifest("compliance", ["dashboard", "powerpoint"]),
    reporting.manifest("certification", ["pdf", "excel"]),
  ];

  return (
    <>
      <PageHeader eyebrow="Board" title="Board Intelligence" description="Board risk, compliance, audit, vendor risk, certification, and executive summary reporting with approval-controlled outputs." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Report Manifests" value={reports.length} detail="Approval-gated board reporting." />
        <StatCard label="Outputs" value="4" detail="PDF, PowerPoint, Excel, Dashboard." tone="healthy" />
        <StatCard label="Approval Control" value="Required" detail="Board packets require review." tone="attention" />
      </div>
      <Section title="Board Reports">
        <DataTable columns={["Report", "Outputs", "Approval"]} empty="No board reports." rows={reports.map((report) => [report.type, report.outputs.join(", "), <StatusBadge key={report.type} tone="warning">Required</StatusBadge>])} />
      </Section>
    </>
  );
}
