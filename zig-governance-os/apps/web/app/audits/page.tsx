import { AuditManagementEngine } from "@zig/audits";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function AuditsPage() {
  await requireTenantContext();
  const readiness = new AuditManagementEngine().readiness({ evidenceCoverage: 72, controlEffectiveness: 64, openFindings: 3, remediationOverdue: 1 });

  return (
    <>
      <PageHeader eyebrow="Audit" title="Audit Management" description="Audit programs, findings, recommendations, responses, remediation, and closure lifecycle." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Audit Readiness" value={readiness} detail="Evidence coverage, control effectiveness, findings, and overdue remediation." />
        <StatCard label="Lifecycle States" value="6" detail="Planned, active, fieldwork, review, remediation, closed." />
        <StatCard label="Finding Workflow" value="Ready" detail="Findings, recommendations, responses, remediation, closure." tone="healthy" />
      </div>
      <Section title="Audit Objects">
        <DataTable
          columns={["Object", "Purpose", "Status"]}
          empty="No audit objects configured."
          rows={[
            ["Audit Programs", "Reusable audit scope and cadence", <StatusBadge key="programs" tone="success">ready</StatusBadge>],
            ["Audit Findings", "Deficiency tracking and severity", <StatusBadge key="findings" tone="success">ready</StatusBadge>],
            ["Management Responses", "Owner response and remediation plan", <StatusBadge key="responses" tone="success">ready</StatusBadge>],
          ]}
        />
      </Section>
    </>
  );
}
