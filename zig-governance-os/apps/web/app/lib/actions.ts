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
