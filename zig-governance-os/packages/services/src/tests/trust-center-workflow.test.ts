import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertTrustCenterWorkflowPublishesAndRespondsToRequests(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_trust", actorUserId: "user_trust" };
  const otherTenantContext = { tenantId: "tenant_other", actorUserId: "user_other" };

  await services.projects.create(context, {
    id: "project_trust",
    name: "Trust Project",
    frameworkId: "framework_trust",
    status: "active",
  });

  // --- Profile: create-then-update via upsertProfile, then publish. ---
  const draftProfile = await services.trustCenter.upsertProfile(context, "project_trust", {
    slug: "acme",
    organizationName: "Acme Co",
  });
  if (draftProfile.isPublished) {
    throw new Error("A freshly created Trust Center profile should not be published by default.");
  }
  const publishedProfile = await services.trustCenter.setPublished(context, draftProfile.id, true);
  if (!publishedProfile.isPublished) {
    throw new Error("setPublished did not persist isPublished=true.");
  }
  const reupserted = await services.trustCenter.upsertProfile(context, "project_trust", {
    slug: "acme",
    organizationName: "Acme Corporation",
  });
  if (reupserted.id !== draftProfile.id || reupserted.organizationName !== "Acme Corporation") {
    throw new Error("upsertProfile did not update the existing profile in place.");
  }

  // --- Documents: publish public + protected, findPublic only returns the public one. ---
  const publicDoc = await services.trustDocuments.publish(context, "project_trust", {
    title: "Information Security Policy",
    category: "information_security_policy",
    visibility: "public",
    sourceUri: "https://example.com/infosec.pdf",
  });
  await services.trustDocuments.publish(context, "project_trust", {
    title: "Disaster Recovery Plan",
    category: "disaster_recovery_plan",
    visibility: "nda_required",
    sourceUri: "https://example.com/dr.pdf",
  });
  const publicDocs = await services.trustDocuments.findPublic(context, "project_trust");
  if (publicDocs.length !== 1 || publicDocs[0].id !== publicDoc.id) {
    throw new Error("findPublic should only return the public, non-expired document.");
  }

  // --- Trust request workflow: Request Submitted -> Approval -> Access Granted -> Document Released. ---
  const requestContext = { tenantId: "tenant_trust" };
  const request = await services.trustRequests.submitRequest(requestContext, "project_trust", {
    documentId: publicDoc.id,
    requesterName: "Jane Auditor",
    requesterEmail: "jane@auditor.example",
    reason: "Vendor security review",
  });
  if (request.status !== "pending") {
    throw new Error("submitRequest should persist status=pending.");
  }

  let fulfillFailed = false;
  try {
    await services.trustRequests.fulfill(context, request.id);
  } catch {
    fulfillFailed = true;
  }
  if (!fulfillFailed) {
    throw new Error("fulfill should reject a request that has not been approved yet.");
  }

  const approved = await services.trustRequests.decide(context, request.id, true);
  if (approved.status !== "approved" || approved.decidedByUserId !== "user_trust") {
    throw new Error("decide(true) did not persist an approved decision with the actor user id.");
  }
  const fulfilled = await services.trustRequests.fulfill(context, request.id);
  if (fulfilled.status !== "fulfilled") {
    throw new Error("fulfill did not persist status=fulfilled after approval.");
  }

  // --- Questionnaire automation: template -> submission -> auto-answer -> complete. ---
  const template = await services.questionnaires.createTemplate(context, {
    name: "Lite Security Review",
    templateType: "sig_lite",
    questions: [
      { key: "q1", text: "Do you maintain a vendor management program?" },
      { key: "q2", text: "Describe your evidence and audit review process." },
    ],
  });
  const submission = await services.questionnaires.startSubmission(context, "project_trust", template.id, {
    requesterName: "Sam Prospect",
    requesterEmail: "sam@prospect.example",
  });
  if (submission.status !== "in_progress") {
    throw new Error("startSubmission should persist status=in_progress.");
  }

  const answers = await services.questionnaires.autoAnswer(context, submission.id);
  if (answers.length !== 2 || !answers.every((answer) => answer.aiGenerated)) {
    throw new Error("autoAnswer should persist one AI-generated answer per template question.");
  }
  const answeredSubmission = (await services.questionnaires.findSubmissions(context, "project_trust")).find((row) => row.id === submission.id);
  if (answeredSubmission?.status !== "submitted") {
    throw new Error("autoAnswer should advance the submission to status=submitted.");
  }
  const completed = await services.questionnaires.completeSubmission(context, submission.id);
  if (completed.status !== "completed") {
    throw new Error("completeSubmission did not persist status=completed.");
  }

  // --- Trust analytics: real event counts, not hardcoded. ---
  await services.trustAnalytics.logEvent(requestContext, "project_trust", { eventType: "profile_view" });
  await services.trustAnalytics.logEvent(requestContext, "project_trust", { eventType: "document_view", resourceId: publicDoc.id });
  await services.trustAnalytics.logEvent(requestContext, "project_trust", { eventType: "document_view", resourceId: publicDoc.id });
  const analytics = await services.trustAnalytics.getAnalytics(context, "project_trust");
  if (analytics.totalEvents !== 3 || analytics.profileViews !== 1 || analytics.documentViews !== 2) {
    throw new Error("getAnalytics did not compute the expected event counts from persisted trust_access_logs rows.");
  }
  if (analytics.mostRequestedResourceIds[0]?.resourceId !== publicDoc.id || analytics.mostRequestedResourceIds[0]?.count !== 2) {
    throw new Error("getAnalytics did not rank mostRequestedResourceIds correctly.");
  }

  // --- Tenant isolation: another tenant must see none of this tenant's Trust Center data. ---
  const otherDocs = await services.trustDocuments.findByProject(otherTenantContext, "project_trust");
  const otherRequests = await services.trustRequests.findByProject(otherTenantContext, "project_trust");
  const otherProfile = await services.trustCenter.findByProject(otherTenantContext, "project_trust");
  if (otherDocs.length !== 0 || otherRequests.length !== 0 || otherProfile !== null) {
    throw new Error("Trust Center data leaked across tenant boundaries.");
  }
}

void assertTrustCenterWorkflowPublishesAndRespondsToRequests();
