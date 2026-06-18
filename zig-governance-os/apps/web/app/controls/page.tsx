import { ControlManagementEngine } from "@zig/controls";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function ControlsPage() {
  await requireTenantContext();
  const assessment = new ControlManagementEngine().assess({
    implementation: 72,
    testPassRate: 68,
    evidenceCoverage: 61,
    maturity: 58,
    hasOpenException: false,
  });

  return (
    <>
      <PageHeader eyebrow="Controls" title="Control Management" description="Control ownership, tests, evidence, maturity, exceptions, reviews, and lifecycle governance." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Effectiveness" value={assessment.effectiveness} detail={`Current lifecycle state: ${assessment.lifecycle}.`} />
        <StatCard label="Control Score" value={assessment.score.replaceAll("_", " ")} detail="Scored across implementation, testing, evidence, and maturity." tone="healthy" />
        <StatCard label="Lifecycle States" value="7" detail="Draft through retired, including monitored, tested, and exception states." />
      </div>
      <Section title="Control Operating Model">
        <DataTable
          columns={["Object", "Purpose", "Status"]}
          empty="No control model objects configured."
          rows={[
            ["Control Owners", "Assignable accountability for each control", <StatusBadge key="owners" tone="success">ready</StatusBadge>],
            ["Control Tests", "Manual, automated, and evidence-backed test records", <StatusBadge key="tests" tone="success">ready</StatusBadge>],
            ["Control Exceptions", "Accepted deviations with review lifecycle", <StatusBadge key="exceptions" tone="success">ready</StatusBadge>],
          ]}
        />
      </Section>
    </>
  );
}
