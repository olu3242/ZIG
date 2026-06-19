import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { vendors } from "@/app/lib/mvp-data";

export default async function VendorsPage() {
  await requireTenantContext();
  const highRisk = vendors.filter((vendor) => vendor.inherentRisk === "High").length;
  const complete = vendors.filter((vendor) => vendor.assessmentStatus === "Complete").length;

  return (
    <>
      <PageHeader eyebrow="Vendor Management" title="Vendor Inventory" description="Assess third-party vendors, track questionnaire status, and maintain risk ratings." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Vendors" value={vendors.length} detail="MVP vendor inventory." />
        <StatCard label="High Risk" value={highRisk} detail="Vendors requiring additional review." tone="attention" />
        <StatCard label="Assessments Complete" value={complete} detail="Questionnaires completed." tone="healthy" />
      </div>
      <Section title="Vendors">
        <DataTable
          columns={["Vendor", "Category", "Risk", "Assessment", "Rating"]}
          empty="No vendors configured."
          rows={vendors.map((vendor) => [
            <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="font-medium underline underline-offset-4">{vendor.name}</Link>,
            vendor.category,
            <StatusBadge key={`${vendor.id}-risk`} tone={vendor.inherentRisk === "High" ? "warning" : "neutral"}>{vendor.inherentRisk}</StatusBadge>,
            vendor.assessmentStatus,
            vendor.rating,
          ])}
        />
      </Section>
    </>
  );
}
