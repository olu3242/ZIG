import { PracticeLabEngine } from "@zig/practice-lab";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function PracticeLabPage() {
  await requireTenantContext();
  const lab = new PracticeLabEngine();
  const company = lab.createCompany("Aster Health", "Healthcare");

  return (
    <>
      <PageHeader eyebrow="GRC Practice Lab 2.0" title="Simulated Company Lab" description="A living company simulation with assets, risks, controls, evidence, audits, incidents, vendors, regulators, board, and employees." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Company" value={company.name} detail={company.industry} />
        <StatCard label="Simulation Objects" value={company.objects.length} detail="Full operating model." tone="healthy" />
        <StatCard label="Lab Readiness" value={lab.readiness(company)} detail="Simulated maturity score." />
      </div>
      <Section title="Simulation Objects">
        <DataTable columns={["Object", "Status"]} empty="No objects." rows={company.objects.map((object) => [object, <StatusBadge key={object} tone="success">Active</StatusBadge>])} />
      </Section>
    </>
  );
}
