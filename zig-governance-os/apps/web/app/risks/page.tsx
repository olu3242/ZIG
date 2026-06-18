import { RiskManagementEngine } from "@zig/risks";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function RisksPage() {
  await requireTenantContext();
  const score = new RiskManagementEngine().score({ likelihood: 4, impact: 4, controlEffectiveness: 55, treatmentEffectiveness: 45 });

  return (
    <>
      <PageHeader eyebrow="Risk" title="Risk Management Engine" description="Risk register, categories, owners, treatment, reviews, acceptance, and residual risk scoring." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Inherent Risk" value={score.inherentRisk} detail="Likelihood x impact normalized to 0-100." />
        <StatCard label="Residual Risk" value={score.residualRisk} detail={`Residual band: ${score.band}.`} tone={score.band === "high" || score.band === "critical" ? "attention" : "healthy"} />
        <StatCard label="Treatments" value="4" detail="Mitigate, transfer, accept, avoid." />
      </div>
      <Section title="Risk Model">
        <DataTable
          columns={["Object", "Scoring Input", "Status"]}
          empty="No risk model objects configured."
          rows={[
            ["Risk Register", "Likelihood, impact, owner, treatment, status", <StatusBadge key="register" tone="success">ready</StatusBadge>],
            ["Residual Risk", "Control and treatment effectiveness", <StatusBadge key="residual" tone="success">ready</StatusBadge>],
            ["Risk Acceptance", "Acceptance owner and review cadence", <StatusBadge key="acceptance" tone="success">ready</StatusBadge>],
          ]}
        />
      </Section>
    </>
  );
}
