"use server";

import { redirect } from "next/navigation";
import { FrameworkRegistry } from "@zig/framework-engine";
import { auditAuth, clearSession, requireSession, requireTenantContext, setSession, setTenantProfile } from "./auth";
import { findTenantProfileByAuthUserId, getZigServices, loginWithEmail, requestPasswordReset, signUpWithEmail } from "./supabase";

export async function signupAction(formData: FormData): Promise<void> {
  const email = requireString(formData, "email");
  const password = requireString(formData, "password");
  const session = await signUpWithEmail(email, password);

  if (session) {
    await setSession(session);
    await bridgeBootSequence();
    redirect("/onboarding");
  }

  redirect("/login");
}

export async function loginAction(formData: FormData): Promise<void> {
  const session = await loginWithEmail(requireString(formData, "email"), requireString(formData, "password"));
  await setSession(session);
  const profile = await findTenantProfileByAuthUserId(session.userId);

  if (!profile) {
    redirect("/onboarding");
  }

  await setTenantProfile(profile.tenantId, profile.userId, profile.persona);
  await getZigServices().audit.recordAction(
    { tenantId: profile.tenantId, actorUserId: profile.userId },
    "login",
    "users",
    profile.userId,
    "User logged in",
  );
  await bridgeBootSequence();
  redirect("/dashboard");
}

export async function passwordResetAction(formData: FormData): Promise<void> {
  await requestPasswordReset(requireString(formData, "email"));
  redirect("/login");
}

export async function onboardingAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const services = getZigServices();
  const tenant = await services.tenants.createOrganization({
    name: requireString(formData, "organizationName"),
    slug: requireString(formData, "organizationSlug"),
    ownerUserId: session.userId,
  });
  const user = await services.users.createProfile(
    { tenantId: tenant.id, actorUserId: session.userId },
    {
      id: crypto.randomUUID(),
      authUserId: session.userId,
      email: session.email,
      firstName: requireString(formData, "firstName"),
      lastName: requireString(formData, "lastName"),
      role: "Tenant Admin",
      persona: "Tenant Admin",
    },
  );

  for (const framework of FrameworkRegistry.list()) {
    await services.frameworks.create(
      { tenantId: tenant.id, actorUserId: user.id },
      {
        id: crypto.randomUUID(),
        code: framework.code,
        name: framework.name,
        version: framework.version,
        description: framework.description,
        status: "active",
      },
    );
  }

  await setTenantProfile(tenant.id, user.id, user.persona);
  redirect("/projects/new");
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const services = getZigServices();
  const project = await services.projects.createGovernanceProject(context, {
    name: requireString(formData, "name"),
    industry: formData.get("industry")?.toString(),
    frameworkId: requireString(formData, "frameworkId"),
  });
  await services.audit.recordAction(context, "assign", "project_frameworks", project.id, "Framework assigned to project");
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await auditAuth("logout", "User logged out");
  await clearSession();
  redirect("/login");
}

export async function enrollAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const learningPathId = requireString(formData, "learningPathId");
  const services = getZigServices();
  await services.learning.enroll(context, learningPathId);
  await services.audit.recordAction(context, "create", "user_progress", learningPathId, "Learner enrolled in learning path");
  redirect(`/learning/${learningPathId}`);
}

export async function completeLessonAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const lessonId = requireString(formData, "lessonId");
  const learningPathId = requireString(formData, "learningPathId");
  const services = getZigServices();
  const result = await services.learning.completeLesson(context, lessonId);
  await services.audit.recordAction(
    context,
    "complete",
    "user_progress",
    result.progress.id,
    `Lesson completed; learning score ${result.learningScore}, career score ${result.careerScore}`,
  );
  redirect(`/learning/${learningPathId}`);
}

export async function submitAssessmentAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const assessmentId = requireString(formData, "assessmentId");
  const questionIds = formData.getAll("questionId").map((value) => value.toString());
  const services = getZigServices();

  const answers = questionIds.map((questionId) => {
    const raw = formData.get(`answer_${questionId}`)?.toString();
    return { questionId, selectedOptionIndex: raw === undefined ? -1 : Number.parseInt(raw, 10) };
  });

  const outcome = await services.assessments.submitAttempt(context, assessmentId, answers);
  await services.audit.recordAction(
    context,
    "complete",
    "learning_assessment_results",
    outcome.result.id,
    `Assessment submitted; score ${outcome.score}, passed ${outcome.passed}`,
  );
  redirect(`/assessment/${assessmentId}?score=${outcome.score}&passed=${outcome.passed}`);
}

export async function launchLabAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const scenarioId = requireString(formData, "scenarioId");
  const services = getZigServices();
  const run = await services.scenarios.launchLab(context, scenarioId);
  await services.audit.recordAction(context, "create", "scenario_runs", run.id, "Lab launched from scenario");
  redirect(`/learning/practice-lab/${run.id}`);
}

export async function completeLabTaskAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const scenarioRunId = requireString(formData, "scenarioRunId");
  const labTaskId = requireString(formData, "labTaskId");
  const response = formData.get("response")?.toString() ?? "";
  const services = getZigServices();
  const submission = await services.scenarios.completeTask(context, scenarioRunId, labTaskId, { response });
  await services.audit.recordAction(context, "complete", "lab_task_submissions", submission.id, "Lab task submission persisted");
  redirect(`/learning/practice-lab/${scenarioRunId}`);
}

export async function scoreLabAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const scenarioRunId = requireString(formData, "scenarioRunId");
  const services = getZigServices();
  const outcome = await services.scenarios.scoreAndComplete(context, scenarioRunId);
  await services.audit.recordAction(
    context,
    "complete",
    "lab_artifacts",
    outcome.artifact.id,
    `Lab scored ${outcome.score}% (${outcome.completedTaskCount}/${outcome.totalTaskCount} tasks); skills signal updated`,
  );
  redirect(`/learning/practice-lab/${scenarioRunId}`);
}

export async function uploadEvidenceAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const controlId = requireString(formData, "controlId");
  const title = requireString(formData, "title");
  const sourceUri = formData.get("sourceUri")?.toString().trim() || undefined;
  const services = getZigServices();

  const evidence = await services.evidence.createEvidence(context, { title, controlId, sourceUri });
  await services.audit.recordAction(context, "create", "evidence", evidence.id, "Evidence recorded and linked to control");
  redirect("/evidence");
}

export async function reviewEvidenceAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const evidenceId = requireString(formData, "evidenceId");
  const decision = requireString(formData, "decision");
  if (decision !== "approved" && decision !== "rejected") {
    throw new Error(`Invalid evidence review decision: ${decision}`);
  }
  const services = getZigServices();

  const outcome = await services.evidence.reviewEvidence(context, evidenceId, { status: decision });
  await services.audit.recordAction(
    context,
    "review",
    "evidence_reviews",
    outcome.review.id,
    `Evidence reviewed; decision ${decision}`,
  );
  redirect("/evidence");
}

export async function createVendorAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const name = requireString(formData, "name");
  const projectId = requireString(formData, "projectId");
  const category = formData.get("category")?.toString().trim() || undefined;
  const criticality = formData.get("criticality")?.toString().trim() || undefined;
  const contactEmail = formData.get("contactEmail")?.toString().trim() || undefined;
  const services = getZigServices();

  const vendor = await services.risks.createVendor(context, {
    name,
    projectId,
    category,
    criticality: criticality as "low" | "medium" | "high" | "critical" | undefined,
    contactEmail,
  });
  await services.audit.recordAction(context, "create", "vendors", vendor.id, "Vendor added to register");
  redirect("/vendors");
}

export async function startVendorAssessmentAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const vendorId = requireString(formData, "vendorId");
  const services = getZigServices();

  const assessment = await services.risks.startVendorAssessment(context, vendorId);
  await services.audit.recordAction(context, "create", "vendor_assessments", assessment.id, "Vendor assessment started");
  redirect("/vendors");
}

export async function completeVendorAssessmentAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const vendorAssessmentId = requireString(formData, "vendorAssessmentId");
  const likelihood = Number(requireString(formData, "likelihood"));
  const impact = Number(requireString(formData, "impact"));
  const findingTitle = formData.get("findingTitle")?.toString().trim();
  const findingSeverity = formData.get("findingSeverity")?.toString().trim();
  const services = getZigServices();

  const findings = findingTitle
    ? [{ title: findingTitle, severity: (findingSeverity ?? "medium") as "low" | "medium" | "high" | "critical" }]
    : [];
  const outcome = await services.risks.completeVendorAssessment(context, vendorAssessmentId, likelihood, impact, findings);
  await services.audit.recordAction(
    context,
    "complete",
    "vendor_assessments",
    outcome.assessment.id,
    `Vendor assessment completed; risk score ${outcome.assessment.riskScore}, ${outcome.findings.length} finding(s) recorded`,
  );
  redirect("/vendors");
}

export async function startCoachConversationAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const contextType = (formData.get("contextType")?.toString().trim() || "general") as
    | "learning_path"
    | "lesson"
    | "assessment"
    | "lab"
    | "general";
  const services = getZigServices();

  const { conversation } = await services.coach.startConversation(context, contextType);
  await services.audit.recordAction(context, "create", "coach_conversations", conversation.id, "AI Coach conversation started");
  redirect("/ai-command");
}

export async function sendCoachMessageAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const conversationId = requireString(formData, "conversationId");
  const content = requireString(formData, "content");
  const services = getZigServices();

  const outcome = await services.coach.sendMessage(context, conversationId, content);
  await services.audit.recordAction(context, "create", "coach_messages", outcome.coachMessage.id, "AI Coach replied");
  redirect("/ai-command");
}

export async function runHealthAdvisorAction(formData: FormData): Promise<void> {
  const { context } = await requireTenantContext();
  const projectId = requireString(formData, "projectId");
  const services = getZigServices();

  await services.governance.runHealthAdvisor(context, projectId);
  await services.governance.recordScoreSnapshot(context, projectId);
  await services.audit.recordAction(context, "generate", "recommendations", projectId, "Health Advisor run");
  redirect(`/projects/${projectId}`);
}

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key)?.toString().trim();
  if (!value) {
    throw new Error(`${key} is required.`);
  }
  return value;
}

function bridgeBootSequence(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 800));
}
