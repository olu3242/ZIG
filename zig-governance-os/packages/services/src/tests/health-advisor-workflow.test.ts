import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertHealthAdvisorGeneratesRealRecommendationsAndHistory(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_advisor", actorUserId: "user_advisor" };

  const project = await services.projects.create(context, {
    id: "project_advisor",
    name: "Advisor Project",
    frameworkId: "framework_advisor",
    status: "active",
  });

  // --- Empty project: every one of the 7 inputs is at 0%, so 7 recommendations, all critical. ---
  const emptyRecommendations = await services.governance.runHealthAdvisor(context, project.id);
  if (emptyRecommendations.length !== 7) {
    throw new Error(`Expected 7 recommendations for an empty project, got ${emptyRecommendations.length}.`);
  }
  const criticalEligible = ["controlCoverage", "riskAssessmentCoverage", "evidenceCompleteness"];
  for (const recommendation of emptyRecommendations) {
    const isCriticalEligible = criticalEligible.some((input) => recommendation.title.toLowerCase().includes(input === "controlCoverage" ? "control coverage" : input === "riskAssessmentCoverage" ? "risk assessment coverage" : "evidence completeness"));
    if (isCriticalEligible && recommendation.severity !== "critical") {
      throw new Error(`Expected a 0% foundational input to be critical, got ${recommendation.severity} for "${recommendation.title}".`);
    }
    if (recommendation.confidence !== 1) {
      throw new Error(`Expected every recommendation's confidence to be fixed at 1, got ${recommendation.confidence}.`);
    }
  }
  // --- Sorted by severity: critical entries must come first. ---
  if (emptyRecommendations[0].severity !== "critical") {
    throw new Error("Expected recommendations to be sorted with critical severity first.");
  }

  // --- Persisted, not just returned: a second read must see the same rows. ---
  const persisted = await services.governance.findRecommendations(context, project.id);
  if (persisted.length !== 7) {
    throw new Error(`Expected runHealthAdvisor to persist recommendations, found ${persisted.length} on re-read.`);
  }

  // --- Fully-covered project: zero gaps, zero recommendations. ---
  await repositories.projectFrameworks.create(context, {
    id: "pf_advisor",
    projectId: project.id,
    frameworkId: "framework_advisor",
    assignedByUserId: context.actorUserId,
    assignedAt: new Date(),
  });
  const control = await repositories.controls.create(context, {
    id: "control_advisor",
    projectId: project.id,
    frameworkId: "framework_advisor",
    controlId: "ENC-1",
    title: "Encrypt backups at rest",
    description: "Backups must be encrypted using a managed key.",
    status: "implemented",
    ownerId: "user_advisor",
    sourceType: "operational",
  });
  const risk = await repositories.risks.create(context, {
    id: "risk_advisor",
    projectId: project.id,
    assetId: "asset_advisor",
    title: "Unencrypted backups",
    description: "Backups are not encrypted at rest",
    severity: "high",
    treatment: "mitigate",
    sourceType: "operational",
  });
  await repositories.riskAssessments.create(context, {
    id: "assessment_advisor",
    projectId: project.id,
    riskId: risk.id,
    likelihood: 3,
    impact: 4,
    severity: "high",
    treatmentDecision: "mitigate",
    assessedAt: new Date(),
  });
  const evidence = await services.evidence.createEvidence(context, {
    title: "Backup encryption screenshot",
    controlId: control.id,
  });
  await services.evidence.reviewEvidence(context, evidence.id, { status: "approved" });
  const vendor = await services.risks.createVendor(context, { name: "Acme Cloud", projectId: project.id });
  const vendorAssessment = await services.risks.startVendorAssessment(context, vendor.id);
  await services.risks.completeVendorAssessment(context, vendorAssessment.id, 1, 1);

  const fullyCoveredRecommendations = await services.governance.runHealthAdvisor(context, project.id);
  if (fullyCoveredRecommendations.length !== 0) {
    throw new Error(`Expected a fully-covered project to generate zero recommendations, got ${fullyCoveredRecommendations.length}.`);
  }

  // --- Score history: real, persisted, chronologically ordered snapshots, not constants. ---
  const firstSnapshot = await services.governance.recordScoreSnapshot(context, project.id);
  await repositories.controls.create(context, {
    id: "control_advisor_2",
    projectId: project.id,
    frameworkId: "framework_advisor",
    controlId: "ROT-1",
    title: "Rotate access keys",
    description: "Access keys must be rotated quarterly.",
    status: "planned",
    sourceType: "operational",
  });
  const secondSnapshot = await services.governance.recordScoreSnapshot(context, project.id);

  const history = await services.governance.getScoreHistory(context, project.id);
  if (history.length !== 2) {
    throw new Error(`Expected 2 persisted score snapshots, got ${history.length}.`);
  }
  if (history[0].id !== firstSnapshot.id || history[1].id !== secondSnapshot.id) {
    throw new Error("Expected getScoreHistory to return snapshots in chronological order.");
  }
  if (secondSnapshot.score >= firstSnapshot.score) {
    throw new Error(`Expected the second snapshot's score to be lower after adding an unimplemented control, got ${secondSnapshot.score} vs ${firstSnapshot.score}.`);
  }
}

void assertHealthAdvisorGeneratesRealRecommendationsAndHistory();
