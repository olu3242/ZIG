import { PageHeader, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { assessments, evidenceTemplates, labs, learningPaths, risks, scoreRisk, vendorScores, vendors, zigScore } from "@/app/lib/mvp-data";

export default async function CommandCenterPage() {
  await requireTenantContext();
  const learningProgress = Math.round(learningPaths.reduce((sum, path) => sum + path.progress, 0) / learningPaths.length);
  const labCompletion = Math.round((labs.filter((lab) => lab.score >= 80).length / labs.length) * 100);
  const riskExposure = risks.filter((risk) => scoreRisk(risk) >= 15).length;
  const evidenceCoverage = Math.round((evidenceTemplates.filter((item) => item.status === "Current").length / evidenceTemplates.length) * 100);
  const vendorRisk = vendors.filter((vendor) => vendorScores(vendor).decision !== "Approved").length;
  const assessmentPass = Math.round((assessments.filter((item) => item.score >= item.passingScore).length / assessments.length) * 100);

  return (
    <>
      <PageHeader eyebrow="Executive" title="Compliance Command Center" description="Launch-ready executive view of learning progress, lab completion, risk exposure, evidence coverage, vendor risk, and career growth." />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="ZIG Score" value={zigScore()} detail="Learning, labs, assessments, portfolio, certifications." tone="healthy" />
        <StatCard label="Learning Progress" value={`${learningProgress}%`} detail="Average learning path completion." />
        <StatCard label="Lab Completion" value={`${labCompletion}%`} detail="Labs above pass threshold." />
        <StatCard label="Assessment Pass" value={`${assessmentPass}%`} detail="Assessment pass rate." />
        <StatCard label="Risk Exposure" value={riskExposure} detail="High and critical risks." tone="attention" />
        <StatCard label="Evidence Coverage" value={`${evidenceCoverage}%`} detail="Current evidence templates." />
        <StatCard label="Vendor Risk" value={vendorRisk} detail="Conditional or rejected vendors." />
        <StatCard label="Career Growth" value="5 tracks" detail="Career journeys and badges active." tone="healthy" />
      </div>
    </>
  );
}
