import { getZigServices } from "./supabase";
import { requireTenantContext } from "./auth";

export async function loadDashboard() {
  const { context, persona } = await requireTenantContext();
  const services = getZigServices();
  const [tenant, projects, frameworks, learning, assessments, labs, evidence, vendorRisk] = await Promise.all([
    services.tenants.findProfileTenant(context),
    services.projects.findMany(context),
    services.frameworks.findAvailableFrameworks(context),
    services.learning.getLearnerSummary(context),
    services.assessments.getLearnerAssessmentSummary(context),
    services.scenarios.getLearnerLabSummary(context),
    services.evidence.getEvidenceSummary(context),
    services.risks.getVendorRiskSummary(context),
  ]);
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const latestProject = projects[0];

  return {
    tenant,
    persona,
    projects,
    frameworks,
    stats: {
      governanceScore: latestProject ? 25 : 0,
      projectCount: projects.length,
      activeProjects,
      frameworkCount: frameworks.length,
      onboardingState: latestProject ? "Project created" : "Project needed",
      enrolledPathCount: learning.enrolledPathCount,
      completedLessonCount: learning.completedLessonCount,
      assessmentAttemptCount: assessments.attemptCount,
      assessmentPassedCount: assessments.passedCount,
      labLaunchedCount: labs.launchedRunCount,
      labCompletedCount: labs.completedRunCount,
      evidenceCount: evidence.evidenceCount,
      evidencePendingReviewCount: evidence.pendingReviewCount,
      evidenceApprovedCount: evidence.approvedCount,
      vendorCount: vendorRisk.vendorCount,
      vendorOpenFindingCount: vendorRisk.openFindingCount,
      vendorAverageRiskScore: vendorRisk.averageRiskScore,
    },
  };
}

export async function loadVendors() {
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const [projects, vendors] = await Promise.all([
    services.projects.findMany(context),
    services.risks.findVendors(context),
  ]);

  const assessmentsByVendorId = new Map<string, Awaited<ReturnType<typeof services.risks.findVendorAssessments>>>();
  const findingsByAssessmentId = new Map<string, Awaited<ReturnType<typeof services.risks.findVendorFindings>>>();
  for (const vendor of vendors) {
    const assessments = await services.risks.findVendorAssessments(context, vendor.id);
    assessmentsByVendorId.set(vendor.id, assessments);
    for (const assessment of assessments) {
      findingsByAssessmentId.set(assessment.id, await services.risks.findVendorFindings(context, assessment.id));
    }
  }

  return { projects, vendors, assessmentsByVendorId, findingsByAssessmentId };
}

export async function loadEvidence() {
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const [controls, evidenceRows] = await Promise.all([
    services.controls.findMany(context),
    services.evidence.findMany(context),
  ]);

  const reviewsByEvidenceId = new Map<string, Awaited<ReturnType<typeof services.evidence.findReviews>>>();
  for (const row of evidenceRows) {
    reviewsByEvidenceId.set(row.id, await services.evidence.findReviews(context, row.id));
  }

  return { controls, evidence: evidenceRows, reviewsByEvidenceId };
}

export async function loadProjects() {
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const [projects, frameworks] = await Promise.all([
    services.projects.findMany(context),
    services.frameworks.findAvailableFrameworks(context),
  ]);

  return { projects, frameworks };
}

export async function loadFrameworks() {
  const { context } = await requireTenantContext();
  return getZigServices().frameworks.findAvailableFrameworks(context);
}
