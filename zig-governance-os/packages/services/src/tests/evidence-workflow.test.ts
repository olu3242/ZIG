import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertEvidenceWorkflowPersistsLinksAndReviews(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_evidence", actorUserId: "user_evidence" };

  await repositories.controls.create(context, {
    id: "control_1",
    projectId: "project_1",
    frameworkId: "framework_1",
    controlId: "A.9.2",
    title: "Access provisioning review",
    description: "Quarterly access review for privileged accounts",
    status: "needs_evidence",
    sourceType: "operational",
  });

  // --- createEvidence persists a real evidence row and a real control_evidence link. ---
  const evidence = await services.evidence.createEvidence(context, {
    title: "Q2 access review export",
    controlId: "control_1",
    sourceUri: "https://files.example.com/q2-access-review.csv",
  });

  if (evidence.status !== "submitted" || evidence.projectId !== "project_1" || evidence.controlId !== "control_1") {
    throw new Error("createEvidence did not persist the expected evidence row.");
  }

  const links = await services.evidence.findLinksForControl(context, "control_1");
  if (links.length !== 1 || links[0].evidenceId !== evidence.id || links[0].coverage !== "supporting") {
    throw new Error("createEvidence did not persist the expected control_evidence link row.");
  }

  // --- linkToControl is idempotent: linking the same pair again does not duplicate. ---
  await services.evidence.linkToControl(context, evidence.id, "control_1");
  const linksAfterDuplicateLink = await services.evidence.findLinksForControl(context, "control_1");
  if (linksAfterDuplicateLink.length !== 1) {
    throw new Error("linkToControl created a duplicate control_evidence row instead of staying idempotent.");
  }

  // --- findByControl returns the real persisted evidence for the control. ---
  const evidenceForControl = await services.evidence.findByControl(context, "control_1");
  if (evidenceForControl.length !== 1 || evidenceForControl[0].id !== evidence.id) {
    throw new Error("findByControl did not return the persisted evidence row.");
  }

  // --- Dashboard summary reflects one unreviewed (pending) evidence record. ---
  const summaryBeforeReview = await services.evidence.getEvidenceSummary(context);
  if (summaryBeforeReview.evidenceCount !== 1 || summaryBeforeReview.pendingReviewCount !== 1 || summaryBeforeReview.approvedCount !== 0) {
    throw new Error(
      `Expected 1 pending evidence record before review, got evidenceCount=${summaryBeforeReview.evidenceCount}, pendingReviewCount=${summaryBeforeReview.pendingReviewCount}, approvedCount=${summaryBeforeReview.approvedCount}.`,
    );
  }

  // --- reviewEvidence(rejected) persists an evidence_reviews row but leaves evidence status as submitted. ---
  const rejected = await services.evidence.reviewEvidence(context, evidence.id, { status: "rejected" });
  if (rejected.review.status !== "rejected" || rejected.review.reviewerUserId !== "user_evidence") {
    throw new Error("reviewEvidence(rejected) did not persist the expected evidence_reviews row.");
  }
  if (rejected.evidence.status !== "submitted") {
    throw new Error("A rejected review must not flip evidence status to approved.");
  }

  const reviewsAfterRejection = await services.evidence.findReviews(context, evidence.id);
  if (reviewsAfterRejection.length !== 1 || reviewsAfterRejection[0].status !== "rejected") {
    throw new Error("findReviews did not return the persisted rejected review.");
  }

  // --- A subsequent approve persists a second review row and flips evidence status. ---
  const approved = await services.evidence.reviewEvidence(context, evidence.id, { status: "approved" });
  if (approved.evidence.status !== "approved") {
    throw new Error("reviewEvidence(approved) did not flip the evidence row's status to approved.");
  }

  const reviewsAfterApproval = await services.evidence.findReviews(context, evidence.id);
  if (reviewsAfterApproval.length !== 2) {
    throw new Error("Expected two evidence_reviews rows (one rejected, one approved) to be on record.");
  }

  // --- Dashboard summary now reflects the approved record. ---
  const summaryAfterReview = await services.evidence.getEvidenceSummary(context);
  if (summaryAfterReview.evidenceCount !== 1 || summaryAfterReview.pendingReviewCount !== 0 || summaryAfterReview.approvedCount !== 1) {
    throw new Error(
      `Expected the evidence record to be approved, got evidenceCount=${summaryAfterReview.evidenceCount}, pendingReviewCount=${summaryAfterReview.pendingReviewCount}, approvedCount=${summaryAfterReview.approvedCount}.`,
    );
  }

  // --- createEvidence against a non-existent control fails loudly rather than silently. ---
  let threw = false;
  try {
    await services.evidence.createEvidence(context, { title: "Orphan evidence", controlId: "control_missing" });
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("createEvidence must reject evidence attached to a non-existent control.");
  }
}

void assertEvidenceWorkflowPersistsLinksAndReviews();
