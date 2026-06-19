import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { vendorScores, vendors } from "@/app/lib/mvp-data";

const questions = [
  "Does the vendor maintain an information security policy approved by leadership?",
  "Does the vendor perform annual access reviews for privileged users?",
  "Does the vendor encrypt customer data in transit and at rest?",
  "Does the vendor notify customers of security incidents within contract timelines?",
  "Does the vendor provide independent assurance evidence such as SOC 2 or ISO certification?",
];

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTenantContext();
  const { id } = await params;
  const vendor = vendors.find((item) => item.id === id) ?? vendors[0];
  const scores = vendorScores(vendor);

  return (
    <>
      <PageHeader eyebrow="Vendor Profile" title={vendor.name} description="Vendor questionnaire, inherent risk, assessment status, and residual risk rating." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Category" value={vendor.category} detail="Vendor service category." />
        <StatCard label="Inherent Risk" value={vendor.inherentRisk} detail="Pre-control vendor risk." tone={vendor.inherentRisk === "High" ? "attention" : "neutral"} />
        <StatCard label="Assessment" value={vendor.assessmentStatus} detail="Questionnaire lifecycle state." />
        <StatCard label="Decision" value={scores.decision} detail={`Overall score: ${scores.overall}.`} tone={scores.decision === "Approved" ? "healthy" : "attention"} />
      </div>
      <Section title="Vendor Risk Scoring">
        <DataTable
          columns={["Security", "Privacy", "Compliance", "Overall", "Decision"]}
          empty="No scores."
          rows={[[scores.security, scores.privacy, scores.compliance, scores.overall, <StatusBadge key="decision" tone={scores.decision === "Approved" ? "success" : "warning"}>{scores.decision}</StatusBadge>]]}
        />
      </Section>
      <Section title="Assessment Questionnaire">
        <DataTable
          columns={["Question", "Response"]}
          empty="No questionnaire."
          rows={questions.map((question, index) => [
            question,
            <StatusBadge key={question} tone={index < 3 ? "success" : "warning"}>{index < 3 ? "complete" : "review"}</StatusBadge>,
          ])}
        />
      </Section>
      <Link href="/vendors" className="w-fit rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm">Back to vendors</Link>
    </>
  );
}
