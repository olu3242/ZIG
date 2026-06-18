import { ServicesMarketplace, type ManagedService } from "@zig/services-marketplace";
import { PageHeader, Section, DataTable, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

const services: ManagedService[] = ["virtual_ciso", "virtual_compliance_officer", "virtual_risk_officer", "audit_readiness", "vendor_risk", "policy_services", "certification_readiness", "training_services", "implementation_services"];

export default async function ServicesPage() {
  await requireTenantContext();
  const marketplace = new ServicesMarketplace();
  const sampleLifecycle = marketplace.lifecycle("virtual_ciso");

  return (
    <>
      <PageHeader eyebrow="Managed GRC" title="Services Platform" description="Request, scope, engage, deliver, review, invoice, and close managed governance, risk, compliance, audit, vendor, policy, training, and certification services." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Services" value={services.length} detail="Managed service catalog." />
        <StatCard label="Lifecycle Stages" value={sampleLifecycle.length} detail="Request through close." tone="healthy" />
        <StatCard label="Delivery Model" value="Human + AI" detail="Service workflows remain approval-led." />
      </div>
      <Section title="Service Catalog">
        <DataTable columns={["Service", "Lifecycle"]} empty="No services available." rows={services.map((service) => [service, marketplace.lifecycle(service).map((step) => step.stage).join(" -> ")])} />
      </Section>
    </>
  );
}
