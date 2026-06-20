import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertGovernanceScoreIsRealAndExplainable(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_gov", actorUserId: "user_gov" };

  const project = await services.projects.create(context, {
    id: "project_gov",
    name: "Governance Project",
    frameworkId: "framework_gov",
    status: "active",
  });

  // --- Empty project: every input must be 0, never null/100, score must be 0. ---
  const empty = await services.governance.calculateScore(context, project.id);
  if (empty.score !== 0) {
    throw new Error(`Expected an empty project to score 0, got ${empty.score}.`);
  }
  if (empty.healthState !== "Foundation") {
    throw new Error(`Expected an empty project to be in the Foundation health state, got ${empty.healthState}.`);
  }
  if (
    empty.controlCoverage !== 0 ||
    empty.riskAssessmentCoverage !== 0 ||
    empty.evidenceCompleteness !== 0 ||
    empty.frameworkCoverage !== 0 ||
    empty.ownershipCompleteness !== 0 ||
    empty.reviewCompletion !== 0 ||
    empty.vendorAssessmentCoverage !== 0
  ) {
    throw new Error("Expected every input to be 0 for an empty project, not null/100.");
  }

  // --- Populate real data: one fully-covered control, one assessed risk, one vendor with a completed assessment. ---
  await repositories.projectFrameworks.create(context, {
    id: "pf_gov",
    projectId: project.id,
    frameworkId: "framework_gov",
    assignedByUserId: context.actorUserId,
    assignedAt: new Date(),
  });

  const control = await repositories.controls.create(context, {
    id: "control_gov",
    projectId: project.id,
    frameworkId: "framework_gov",
    controlId: "ENC-1",
    title: "Encrypt backups at rest",
    description: "Backups must be encrypted using a managed key.",
    status: "implemented",
    ownerId: "user_gov",
  });

  const risk = await repositories.risks.create(context, {
    id: "risk_gov",
    projectId: project.id,
    assetId: "asset_gov",
    title: "Unencrypted backups",
    description: "Backups are not encrypted at rest",
    severity: "high",
    treatment: "mitigate",
  });

  await repositories.riskAssessments.create(context, {
    id: "assessment_gov",
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

  const populated = await services.governance.calculateScore(context, project.id);
  if (
    populated.controlCoverage !== 100 ||
    populated.riskAssessmentCoverage !== 100 ||
    populated.evidenceCompleteness !== 100 ||
    populated.frameworkCoverage !== 100 ||
    populated.ownershipCompleteness !== 100 ||
    populated.reviewCompletion !== 100 ||
    populated.vendorAssessmentCoverage !== 100
  ) {
    throw new Error(`Expected every input to be 100% for a fully-covered project, got ${JSON.stringify(populated)}.`);
  }
  if (populated.score !== 100 || populated.healthState !== "Optimized") {
    throw new Error(`Expected a fully-covered project to score 100/Optimized, got ${populated.score}/${populated.healthState}.`);
  }

  // --- Add a second, unowned, unimplemented control: real, non-constant degradation. ---
  await repositories.controls.create(context, {
    id: "control_gov_2",
    projectId: project.id,
    frameworkId: "framework_gov",
    controlId: "ROT-1",
    title: "Rotate access keys",
    description: "Access keys must be rotated quarterly.",
    status: "planned",
  });

  const degraded = await services.governance.calculateScore(context, project.id);
  if (degraded.score >= populated.score) {
    throw new Error(`Expected adding an unimplemented, unowned control to lower the score below ${populated.score}, got ${degraded.score}.`);
  }
  if (!degraded.explanation.includes("%")) {
    throw new Error("Expected the explanation to name the lowest-scoring input with its percentage.");
  }
}

void assertGovernanceScoreIsRealAndExplainable();
