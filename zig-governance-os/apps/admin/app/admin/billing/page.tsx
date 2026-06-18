import { BillingPlatform } from "@zig/billing";
import { requirePlatformOwner } from "../guard";

export default async function AdminBillingPage() {
  await requirePlatformOwner();
  const plans = new BillingPlatform().listPlans();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">Billing Command Center</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Plans" value={plans.length} />
        <Metric label="Stripe Webhooks" value={8} />
        <Metric label="Billing Tables" value={9} />
        <Metric label="Audit Events" value={6} />
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded border p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>;
}
