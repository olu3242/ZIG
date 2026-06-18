import { ExecutiveDigitalTwin, type TwinComponent } from "@zig/digital-twin";
import { PageHeader, Section, StatCard, DataTable, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

const twinStates: Array<{ component: TwinComponent; currentScore: number; targetScore: number }> = [
  { component: "governance", currentScore: 78, targetScore: 90 },
  { component: "risk", currentScore: 64, targetScore: 82 },
  { component: "compliance", currentScore: 81, targetScore: 92 },
  { component: "audit", currentScore: 69, targetScore: 88 },
  { component: "vendor", currentScore: 58, targetScore: 80 },
  { component: "policy", currentScore: 74, targetScore: 90 },
  { component: "certification", currentScore: 67, targetScore: 86 },
];

export default async function DigitalTwinPage() {
  await requireTenantContext();
  const twin = new ExecutiveDigitalTwin();
  const averageCurrent = Math.round(twinStates.reduce((sum, state) => sum + state.currentScore, 0) / twinStates.length);
  const averageForecast = Math.round(twinStates.reduce((sum, state) => sum + twin.forecast(state, "180_day"), 0) / twinStates.length);

  return (
    <>
      <PageHeader
        eyebrow="Executive Digital Twin"
        title="Real-Time Compliance Twin"
        description="A live representation of governance, risk, compliance, audit, vendor, policy, and certification health with 90, 180, and 365 day outlooks."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Current Health" value={averageCurrent} detail="Average twin posture." />
        <StatCard label="180 Day Forecast" value={averageForecast} detail="Projected autonomous uplift." tone="healthy" />
        <StatCard label="Largest Gap" value={Math.max(...twinStates.map((state) => twin.gap(state)))} detail="Maximum delta to target." tone="attention" />
        <StatCard label="Twin Components" value={twinStates.length} detail="Governance through certification." />
      </div>

      <Section title="Twin Forecast">
        <DataTable
          columns={["Component", "Current", "Target", "90 Day", "180 Day", "365 Day", "Gap"]}
          empty="No twin components available."
          rows={twinStates.map((state) => [
            <span key="component" className="capitalize">{state.component}</span>,
            state.currentScore,
            state.targetScore,
            twin.forecast(state, "90_day"),
            twin.forecast(state, "180_day"),
            twin.forecast(state, "365_day"),
            <StatusBadge key="gap" tone={twin.gap(state) > 15 ? "warning" : "success"}>{twin.gap(state)}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
