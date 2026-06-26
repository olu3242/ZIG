import { createInMemoryRepositories } from "@zig/data-access";
import { createServices, type ZigServices } from "../factory";

const context = { tenantId: "tenant_evidence", actorUserId: "user_evidence" };

async function seedEvidence(): Promise<{ services: ZigServices; evidenceId: string; controlId: string }> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);

  await services.frameworks.create(context, {
    id: "framework_1",
    code: "iso27001",
    name: "ISO 27001",
    version: "2022",
    description: "",
  });

  await services.controls.create(context, {
    id: "control_1",
    projectId: "project_1",
    frameworkId: "framework_1",
    controlId: "A.5.1",
    title: "Information Security Policy",
    description: "",
    status: "planned",
  });

  await services.evidence.create(context, {
    id: "evidence_1",
    projectId: "project_1",
    controlId: "control_1",
    title: "Security Policy PDF",
    status: "submitted",
    health: "missing",
  });

  return { services, evidenceId: "evidence_1", controlId: "control_1" };
}

async function assertEvidenceRequestDefaultsToRequestedStatus(): Promise<void> {
  const { services, controlId } = await seedEvidence();

  const request = await services.evidence.createRequest(context, {
    id: "request_1",
    controlId,
  });

  if (request.status !== "requested") {
    throw new Error(`Expected a new Evidence Request to default to status 'requested', got '${request.status}'.`);
  }
}

async function assertEvidenceRequestStatusAdvancesThroughWorkflow(): Promise<void> {
  const { services, controlId } = await seedEvidence();

  await services.evidence.createRequest(context, { id: "request_2", controlId });
  await services.evidence.advanceRequestStatus(context, "request_2", "assigned");
  const collected = await services.evidence.advanceRequestStatus(context, "request_2", "collected", {
    resultingEvidenceId: "evidence_1",
  });

  if (!collected || collected.status !== "collected" || collected.resultingEvidenceId !== "evidence_1") {
    throw new Error("Expected Evidence Request to advance to 'collected' and record the resulting evidence id.");
  }
}

async function assertCreateMappingIsRetrievableByEvidenceAndByControl(): Promise<void> {
  const { services, evidenceId, controlId } = await seedEvidence();

  await services.evidence.createMapping(context, {
    id: "mapping_1",
    controlId,
    evidenceId,
    coverage: "primary",
  });

  const byEvidence = await services.evidence.findMappingsForEvidence(context, evidenceId);
  const byControl = await services.evidence.findMappingsForControl(context, controlId);

  if (byEvidence.length !== 1 || byControl.length !== 1) {
    throw new Error("Expected control_evidence mapping to be retrievable from both directions.");
  }
}

async function assertResolveAndPersistHealthWritesCategoricalHealth(): Promise<void> {
  const { services, evidenceId } = await seedEvidence();

  const updated = await services.evidence.resolveAndPersistHealth(context, evidenceId, {
    source: "manual_upload",
    exists: true,
    reviewStatus: "approved",
    mappedControlIds: [],
  });

  if (!updated || updated.health !== "approved") {
    throw new Error(`Expected resolveAndPersistHealth to persist 'approved', got '${updated?.health}'.`);
  }
}

async function assertComputeAndPersistHealthScoreUsesMappingAndReviewSignals(): Promise<void> {
  const { services, evidenceId, controlId } = await seedEvidence();

  await services.evidence.createMapping(context, {
    id: "mapping_2",
    controlId,
    evidenceId,
    coverage: "primary",
  });
  await services.evidence.createReview(context, {
    id: "review_1",
    evidenceId,
    status: "approved",
  });
  await services.controls.findMappings(context, controlId); // sanity: ControlService reused, not duplicated

  const evidence = await services.evidence.findById(context, evidenceId);
  if (!evidence) {
    throw new Error("Expected seeded evidence to exist.");
  }

  const updated = await services.evidence.computeAndPersistHealthScore(context, { ...evidence, health: "current" });

  if (!updated || typeof updated.healthScore !== "number") {
    throw new Error("Expected computeAndPersistHealthScore to persist a numeric health_score.");
  }

  // freshness(current=100*.30=30) + review(approved=100*.25=25) + usage(1/5*100=20*.15=3)
  // + coverage(primary=100*.15=15) + mapping(no framework_mappings seeded=0*.15=0) = 73
  if (updated.healthScore !== 73) {
    throw new Error(`Expected health score 73 for this fixture, got ${updated.healthScore}.`);
  }
}

void assertEvidenceRequestDefaultsToRequestedStatus();
void assertEvidenceRequestStatusAdvancesThroughWorkflow();
void assertCreateMappingIsRetrievableByEvidenceAndByControl();
void assertResolveAndPersistHealthWritesCategoricalHealth();
void assertComputeAndPersistHealthScoreUsesMappingAndReviewSignals();
