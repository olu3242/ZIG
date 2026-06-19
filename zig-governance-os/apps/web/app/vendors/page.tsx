import { DataTable, FormField, PageHeader, Section, SelectField, StatCard, StatusBadge } from "@zig/ui";
import { completeVendorAssessmentAction, createVendorAction, startVendorAssessmentAction } from "@/app/lib/actions";
import { loadVendors } from "@/app/lib/data";

export default async function VendorsPage() {
  const { projects, vendors, assessmentsByVendorId, findingsByAssessmentId } = await loadVendors();

  const openAssessmentCount = vendors.reduce((count, vendor) => {
    const assessments = assessmentsByVendorId.get(vendor.id) ?? [];
    return count + assessments.filter((assessment) => assessment.status === "in_progress").length;
  }, 0);
  const completedScores = vendors.flatMap((vendor) =>
    (assessmentsByVendorId.get(vendor.id) ?? [])
      .filter((assessment) => assessment.status === "completed")
      .map((assessment) => assessment.riskScore),
  );
  const averageRiskScore = completedScores.length
    ? Math.round(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length)
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="Vendor Risk"
        title="Third-Party / Vendor Risk"
        description="Vendor register, point-in-time risk assessments, and findings — scoped as an extension of the Risk Workspace."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Vendors" value={vendors.length} detail="Real rows in the vendors table." />
        <StatCard label="Open Assessments" value={openAssessmentCount} detail="vendor_assessments status = in_progress." tone={openAssessmentCount > 0 ? "attention" : "healthy"} />
        <StatCard label="Average Risk Score" value={averageRiskScore} detail="Across completed assessments (likelihood x impact, 0-100)." />
      </div>

      <Section title="Add Vendor">
        {projects.length === 0 ? (
          <p className="text-sm text-[var(--zig-ink-muted)]">No projects exist yet for this tenant — a project must exist before a vendor can be added.</p>
        ) : (
          <form action={createVendorAction} className="grid gap-4 md:grid-cols-2">
            <SelectField label="Project" name="projectId" required options={projects.map((project) => ({ label: project.name, value: project.id }))} />
            <FormField label="Vendor Name" name="name" required />
            <FormField label="Category (optional)" name="category" />
            <SelectField
              label="Criticality"
              name="criticality"
              options={[
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
                { label: "Critical", value: "critical" },
              ]}
            />
            <FormField label="Contact Email (optional)" name="contactEmail" />
            <div className="flex items-end">
              <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Add Vendor</button>
            </div>
          </form>
        )}
      </Section>

      <Section title="Vendor Register">
        <DataTable
          columns={["Vendor", "Criticality", "Status", "Latest Assessment", "Action"]}
          empty="No vendors recorded yet."
          rows={vendors.map((vendor) => {
            const assessments = assessmentsByVendorId.get(vendor.id) ?? [];
            const latest = assessments[assessments.length - 1];
            const findings = latest ? findingsByAssessmentId.get(latest.id) ?? [] : [];

            return [
              vendor.name,
              <StatusBadge key={`${vendor.id}-criticality`} tone={vendor.criticality === "critical" || vendor.criticality === "high" ? "warning" : "neutral"}>
                {vendor.criticality}
              </StatusBadge>,
              <StatusBadge key={`${vendor.id}-status`} tone={vendor.status === "active" ? "success" : "neutral"}>{vendor.status}</StatusBadge>,
              latest ? (
                <div key={`${vendor.id}-latest`} className="text-xs">
                  <StatusBadge tone={latest.status === "completed" ? "success" : "warning"}>{latest.status}</StatusBadge>
                  {latest.status === "completed" ? ` — risk score ${latest.riskScore}, ${findings.length} finding(s)` : ""}
                </div>
              ) : (
                "No assessment yet"
              ),
              latest && latest.status === "in_progress" ? (
                <form key={`${vendor.id}-complete`} action={completeVendorAssessmentAction} className="grid gap-1">
                  <input type="hidden" name="vendorAssessmentId" value={latest.id} />
                  <input type="number" name="likelihood" min={1} max={5} placeholder="Likelihood 1-5" required className="rounded border px-2 py-1 text-xs" />
                  <input type="number" name="impact" min={1} max={5} placeholder="Impact 1-5" required className="rounded border px-2 py-1 text-xs" />
                  <input type="text" name="findingTitle" placeholder="Finding (optional)" className="rounded border px-2 py-1 text-xs" />
                  <button className="rounded-md border border-[var(--zig-ink)] px-2 py-1 text-xs font-medium">Complete Assessment</button>
                </form>
              ) : (
                <form key={`${vendor.id}-start`} action={startVendorAssessmentAction}>
                  <input type="hidden" name="vendorId" value={vendor.id} />
                  <button className="rounded-md border border-[var(--zig-ink)] px-2 py-1 text-xs font-medium">Start Assessment</button>
                </form>
              ),
            ];
          })}
        />
      </Section>
    </>
  );
}
