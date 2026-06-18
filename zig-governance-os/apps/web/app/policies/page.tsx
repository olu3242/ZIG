import { PolicyManagementEngine } from "@zig/policies";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function PoliciesPage() {
  await requireTenantContext();
  const coverage = new PolicyManagementEngine().coverage({ requiredPolicies: 24, publishedPolicies: 18, overdueReviews: 2 });

  return (
    <>
      <PageHeader eyebrow="Policies" title="Policy Management" description="Policies, standards, procedures, guidelines, exceptions, approvals, reviews, and attestations." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Policy Coverage" value={coverage} detail="Published required policies adjusted for overdue reviews." />
        <StatCard label="Lifecycle States" value="5" detail="Draft, review, approved, published, retired." />
        <StatCard label="Attestations" value="Ready" detail="Employee and owner acknowledgement model." tone="healthy" />
      </div>
      <Section title="Policy System">
        <DataTable
          columns={["Object", "Purpose", "Status"]}
          empty="No policy objects configured."
          rows={[
            ["Policies", "Governing control and risk expectations", <StatusBadge key="policies" tone="success">ready</StatusBadge>],
            ["Exceptions", "Approved temporary policy deviations", <StatusBadge key="exceptions" tone="success">ready</StatusBadge>],
            ["Reviews", "Scheduled policy review and approval", <StatusBadge key="reviews" tone="success">ready</StatusBadge>],
          ]}
        />
      </Section>
    </>
  );
}
