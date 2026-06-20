import { getZigServices, findPublishedTrustProfileBySlug } from "./supabase";
import { requireTenantContext } from "./auth";
import { trackForLearningPath } from "./certificationTracks";

export async function loadDashboard() {
  const { context, persona } = await requireTenantContext();
  const services = getZigServices();
  const [tenant, projects, frameworks, learning, assessments, labs, evidence, vendorRisk, coachConversations, recentActivity] = await Promise.all([
    services.tenants.findProfileTenant(context),
    services.projects.findMany(context),
    services.frameworks.findAvailableFrameworks(context),
    services.learning.getLearnerSummary(context),
    services.assessments.getLearnerAssessmentSummary(context),
    services.scenarios.getLearnerLabSummary(context),
    services.evidence.getEvidenceSummary(context),
    services.risks.getVendorRiskSummary(context),
    services.coach.findConversations(context),
    services.audit.findRecentActivity(context),
  ]);
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const latestProject = projects[0];
  const governance = latestProject ? await services.governance.calculateScore(context, latestProject.id) : null;

  return {
    tenant,
    persona,
    projects,
    frameworks,
    governance,
    recentActivity,
    stats: {
      governanceScore: governance ? governance.score : 0,
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
      coachConversationCount: coachConversations.length,
      recentActivityCount: recentActivity.length,
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

export async function loadCareer() {
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const [readiness, portfolio] = await Promise.all([
    services.learning.getCareerReadiness(context),
    services.portfolio.getPortfolio(context),
  ]);
  return { readiness, portfolio };
}

export async function loadCoach() {
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const conversations = await services.coach.findConversations(context);

  const messagesByConversationId = new Map<string, Awaited<ReturnType<typeof services.coach.findMessages>>>();
  for (const conversation of conversations) {
    messagesByConversationId.set(conversation.id, await services.coach.findMessages(context, conversation.id));
  }

  return { conversations, messagesByConversationId };
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

/**
 * Internal (authenticated) Trust Center management loader. Composes already-instantiated
 * services from getZigServices() at the page layer — mirroring loadCertifications() and
 * loadDashboard() — rather than injecting GovernanceService/FrameworkCoverageService into a
 * new constructor, since calculateScore()/getComplianceCenter() are service methods, not
 * pure functions.
 */
export async function loadTrustCenter() {
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const projects = await services.projects.findMany(context);
  const project = projects[0];

  if (!project) {
    return { project: null, profile: null, documents: [], requests: [], templates: [], submissions: [], complianceCenter: [], governance: null, vendorRisk: null, analytics: null };
  }

  const [profile, documents, requests, templates, submissions, complianceCenter, governance, vendorRisk] = await Promise.all([
    services.trustCenter.findByProject(context, project.id),
    services.trustDocuments.findByProject(context, project.id),
    services.trustRequests.findByProject(context, project.id),
    services.questionnaires.findTemplates(context),
    services.questionnaires.findSubmissions(context, project.id),
    services.complianceStatus.getComplianceCenter(context),
    services.governance.calculateScore(context, project.id),
    services.risks.getVendorRiskSummary(context),
  ]);
  const analytics = await services.trustAnalytics.getAnalytics(context, project.id);

  return {
    project,
    profile,
    documents,
    requests,
    templates,
    submissions,
    complianceCenter,
    governance,
    vendorRisk,
    analytics,
  };
}

/**
 * Public Trust Portal loader — the only data path that does not call requireTenantContext().
 * Resolves tenant scope exclusively via the published slug lookup, then composes the same
 * read-only services the internal dashboard uses (display results directly, never duplicate
 * the underlying calculation).
 */
export async function loadPublicTrustPortal(slug: string) {
  const profile = await findPublishedTrustProfileBySlug(slug);
  if (!profile) {
    return null;
  }

  const context = { tenantId: profile.tenantId };
  const services = getZigServices();
  const [documents, complianceCenter, governance, vendorRisk] = await Promise.all([
    services.trustDocuments.findPublic(context, profile.projectId),
    services.complianceStatus.getComplianceCenter(context),
    services.governance.calculateScore(context, profile.projectId),
    services.risks.getVendorRiskSummary(context),
  ]);

  await services.trustAnalytics.logEvent(context, profile.projectId, { eventType: "profile_view" });

  return { profile, documents, complianceCenter, governance, vendorRisk };
}

export async function loadCertifications() {
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const [paths, awards] = await Promise.all([
    services.learning.findMany(context),
    services.certificationAwards.getAwards(context),
  ]);

  const tracks = paths.map(trackForLearningPath);
  const eligibilityByTrackKey = new Map<string, Awaited<ReturnType<typeof services.certificationEligibility.evaluateEligibility>>>();
  const progressByTrackKey = new Map<string, Awaited<ReturnType<typeof services.certificationProgress.getProgress>>>();
  for (const track of tracks) {
    eligibilityByTrackKey.set(track.key, await services.certificationEligibility.evaluateEligibility(context, track));
    progressByTrackKey.set(track.key, await services.certificationProgress.getProgress(context, track));
  }

  return { tracks, awards, eligibilityByTrackKey, progressByTrackKey };
}
