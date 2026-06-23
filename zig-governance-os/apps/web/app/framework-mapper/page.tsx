import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { frameworkMappings } from "@/app/lib/mvp-data";

export default async function FrameworkMapperPage() {
  await requireTenantContext();

  return (
    <>
      <PageHeader eyebrow="Framework Mapper" title="Control Crosswalk" description="Compare frameworks, map control coverage, and translate evidence across ISO, SOC 2, and NIST." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Mappings" value={frameworkMappings.length} detail="Seeded launch crosswalks." tone="healthy" />
        <StatCard label="Frameworks" value="3" detail="ISO 27001, SOC 2, NIST CSF." />
        <StatCard label="Coverage" value="Mapped" detail="Control comparison and coverage mapping ready." />
      </div>
      <Section title="Seeded Crosswalks">
        <DataTable
          columns={["ISO 27001", "SOC 2", "NIST CSF", "Coverage", "Status"]}
          empty="No mappings."
          rows={frameworkMappings.map((mapping) => [
            mapping.source,
            mapping.soc2,
            mapping.nist,
            mapping.coverage,
            <StatusBadge key={mapping.source} tone="success">mapped</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
