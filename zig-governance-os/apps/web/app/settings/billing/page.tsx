import { BillingPlatform } from "@zig/billing";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function BillingSettingsPage() {
  await requireTenantContext();
  const plans = new BillingPlatform().listPlans();

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Subscription Command Center"
        description="Tenant-scoped subscription, usage, invoice, payment, and plan-feature readiness."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Current Plan" value="Not configured" detail="Stripe customer and subscription are created through Checkout Sessions." />
        <StatCard label="Billing Health" value="Ready" detail="Invoices, payments, usage, and audit tables are defined." tone="healthy" />
        <StatCard label="Renewal Status" value="Pending" detail="Live status loads after Stripe webhook ingestion." />
      </div>
      <Section title="Plans">
        <DataTable
          columns={["Plan", "Price", "Seats", "Audited"]}
          empty="No plans configured."
          rows={plans.map((plan) => [
            plan.name,
            plan.monthlyPriceCents === null ? "Custom" : `$${(plan.monthlyPriceCents / 100).toFixed(0)}/mo`,
            plan.includedSeats,
            <StatusBadge key={plan.code} tone="success">enabled</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
