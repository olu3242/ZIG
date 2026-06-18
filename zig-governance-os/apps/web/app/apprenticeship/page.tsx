import { ApprenticeshipEngine } from "@zig/apprenticeship";
import { CapstoneEngine } from "@zig/capstones";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function ApprenticeshipPage() {
  await requireTenantContext();
  const apprenticeship = new ApprenticeshipEngine();
  const capstones = new CapstoneEngine();

  return (
    <>
      <PageHeader eyebrow="Apprenticeship Mode" title="Run A GRC Program" description="Immersive AI apprenticeship mode where the student operates a simulated organization with stakeholders, risks, controls, audits, vendors, regulators, and board pressure." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="AI Personas" value={apprenticeship.personas().length} detail="Manager through compliance officer." />
        <StatCard label="Operating Objects" value={apprenticeship.operatingObjects().length} detail="Full simulated organization." tone="healthy" />
        <StatCard label="Capstone Deliverables" value={capstones.deliverables().length} detail="Executive-ready work products." />
      </div>
      <Section title="AI Personas">
        <DataTable columns={["Persona"]} empty="No personas." rows={apprenticeship.personas().map((persona) => [persona.replaceAll("_", " ")])} />
      </Section>
      <Section title="Capstone Deliverables">
        <DataTable columns={["Deliverable"]} empty="No deliverables." rows={capstones.deliverables().map((item) => [item.replaceAll("_", " ")])} />
      </Section>
    </>
  );
}
