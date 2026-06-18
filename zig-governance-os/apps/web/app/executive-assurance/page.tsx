import { ComplianceNetwork } from "@zig/compliance-network";
import { ExecutiveDigitalTwin } from "@zig/digital-twin";
import { PageHeader, Section, DataTable, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function ExecutiveAssurancePage() {
  await requireTenantContext();
  const twin = new ExecutiveDigitalTwin();
  const network = new ComplianceNetwork();
  const state = { component: "compliance" as const, currentScore: 76, targetScore: 92 };

  return (
    <>
      <PageHeader eyebrow="Executive Intelligence" title="Executive Assurance" description="Board reporting, digital twin, compliance forecasting, risk forecasting, certification forecasting, benchmarking, regulatory impact, and executive recommendations." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Current Score" value={state.currentScore} detail="Executive assurance baseline." />
        <StatCard label="Forecast 180" value={twin.forecast(state, "180_day")} detail="Digital twin forecast." tone="healthy" />
        <StatCard label="Gap To Target" value={twin.gap(state)} detail="Executive action delta." tone="attention" />
        <StatCard label="Benchmark Signal" value="Live" detail={network.signal("benchmark", "Financial Services")} />
      </div>
      <Section title="Assurance Outputs">
        <DataTable columns={["Component", "Output"]} empty="No assurance outputs." rows={[["Board Reporting", "Executive summary and board packet"], ["Digital Twin", "90, 180, 365 day forecast"], ["Regulatory Impact", "Mapped recommendation"], ["Industry Benchmarking", "Aggregated anonymized signal"]]} />
      </Section>
    </>
  );
}
