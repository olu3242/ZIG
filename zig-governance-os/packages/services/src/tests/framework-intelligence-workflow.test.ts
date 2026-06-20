import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertFrameworkIntelligenceIsRealAndExplainable(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_fw", actorUserId: "user_fw" };

  await repositories.frameworks.create(context, { id: "fw_iso", code: "ISO27001", name: "ISO 27001", version: "2022", description: "ISO 27001", status: "active" });
  await repositories.frameworks.create(context, { id: "fw_soc2", code: "SOC2", name: "SOC 2", version: "2017", description: "SOC 2", status: "active" });

  await repositories.frameworkControls.create(context, { id: "fc_iso_1", frameworkId: "fw_iso", controlCode: "A.9.1", title: "Access control policy", description: "" });
  await repositories.frameworkControls.create(context, { id: "fc_iso_2", frameworkId: "fw_iso", controlCode: "A.12.1", title: "Operational procedures", description: "" });
  await repositories.frameworkControls.create(context, { id: "fc_soc2_1", frameworkId: "fw_soc2", controlCode: "CC6.1", title: "Logical access controls", description: "" });

  await repositories.frameworkMappings.create(context, {
    id: "fm_1",
    sourceFrameworkControlId: "fc_iso_1",
    targetFrameworkControlId: "fc_soc2_1",
    mappingStrength: "equivalent",
    rationale: "Both govern logical/access control.",
  });

  await repositories.projects.create(context, { id: "proj_fw", name: "Framework Project", industry: "Tech", frameworkId: "fw_iso", status: "active" });

  await repositories.controls.create(context, {
    id: "control_1",
    projectId: "proj_fw",
    frameworkId: "fw_iso",
    controlId: "A.9.1",
    title: "Access control policy",
    description: "",
    status: "implemented",
    sourceType: "operational",
  });
  await repositories.controls.create(context, {
    id: "control_2",
    projectId: "proj_fw",
    frameworkId: "fw_iso",
    controlId: "A.12.1",
    title: "Operational procedures",
    description: "",
    status: "implemented",
    sourceType: "operational",
  });

  await repositories.evidence.create(context, { id: "evidence_1", projectId: "proj_fw", controlId: "control_1", title: "Access policy doc", status: "approved", submittedById: "user_fw", submittedAt: new Date(), sourceType: "operational" });
  await repositories.controlEvidence.create(context, { id: "ce_1", controlId: "control_1", evidenceId: "evidence_1", coverage: "primary" });
  await repositories.evidenceReviews.create(context, { id: "review_1", evidenceId: "evidence_1", reviewerUserId: "user_fw", status: "approved", reviewedAt: new Date() });

  // --- Coverage: control_1 is implemented and backed by approved evidence; control_2 is
  // implemented but has no evidence link, so it counts as "partial", not "implemented". ---
  const coverage = await services.frameworkCoverage.getCoverage(context, "proj_fw", "fw_iso");
  if (coverage.totalControlCount !== 2 || coverage.implementedControlCount !== 1 || coverage.partialControlCount !== 1 || coverage.coveragePercent !== 50) {
    throw new Error(`Expected 1 implemented / 1 partial out of 2 ISO controls (50%), got ${JSON.stringify(coverage)}.`);
  }

  // --- Gaps: the evidence-less control should surface as a gap with an explainable recommendation. ---
  const gaps = await services.frameworkGaps.getGaps(context, "proj_fw", "fw_iso");
  if (gaps.length !== 1 || !gaps[0].recommendation.includes("A.12.1")) {
    throw new Error(`Expected exactly 1 gap referencing A.12.1, got ${JSON.stringify(gaps)}.`);
  }

  // --- Crosswalk: ISO A.9.1 maps to SOC2 CC6.1. ---
  const crosswalk = await services.frameworkMappings.getCrosswalk(context, "fc_iso_1");
  if (crosswalk.length !== 1 || crosswalk[0].targetControlCode !== "CC6.1") {
    throw new Error(`Expected a single crosswalk entry to CC6.1, got ${JSON.stringify(crosswalk)}.`);
  }

  // --- Roadmap to SOC2: CC6.1 already reachable via mapping (low effort), no other SOC2 controls. ---
  const roadmap = await services.frameworkRoadmaps.getRoadmap(context, "proj_fw", "fw_iso", "fw_soc2");
  if (roadmap.targetControlCount !== 1 || roadmap.alreadyCoveredCount !== 1 || roadmap.remainingControlCount !== 0) {
    throw new Error(`Expected SOC2 roadmap to show 1/1 already covered via mapping, got ${JSON.stringify(roadmap)}.`);
  }

  // --- Evidence reuse: evidence_1 (linked to control_1 / A.9.1) reuses into SOC2 CC6.1. ---
  const reuse = await services.evidenceReuse.getReuse(context, "proj_fw");
  const reuseRow = reuse.find((row) => row.evidenceId === "evidence_1");
  if (!reuseRow || reuseRow.reuseCount !== 1 || !reuseRow.reusableFrameworkControlIds.includes("fc_soc2_1")) {
    throw new Error(`Expected evidence_1 to reuse into fc_soc2_1, got ${JSON.stringify(reuseRow)}.`);
  }

  // --- AI Coach: extended, not duplicated. With full risk/control health elsewhere but a real framework gap, the coach should surface it. ---
  const { welcomeMessage } = await services.coach.startConversation(context, "general");
  if (!welcomeMessage.content.includes("framework control")) {
    throw new Error(`Expected the AI Coach to surface the framework gap in its reply, got: "${welcomeMessage.content}"`);
  }

  // --- Tenant isolation: a different tenant must see no frameworks/controls/gaps. ---
  const otherContext = { tenantId: "tenant_fw_other", actorUserId: "user_fw" };
  const otherCoverage = await services.frameworkCoverage.getCoverage(otherContext, "proj_fw", "fw_iso");
  if (otherCoverage.totalControlCount !== 0) {
    throw new Error("Tenant isolation violated: a different tenant context saw framework_controls rows from tenant_fw.");
  }
}

void assertFrameworkIntelligenceIsRealAndExplainable();
