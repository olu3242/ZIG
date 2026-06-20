import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertLearningWorkflowPersistsProgressAndCareerSignal(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_learning", actorUserId: "user_learning" };

  await repositories.learningPaths.create(context, {
    id: "path_1",
    title: "ISO 27001 Foundations",
    description: "Core path",
    progressPercent: 0,
  });

  await repositories.learningModules.create(context, {
    id: "lesson_1",
    learningPathId: "path_1",
    title: "Intro lesson",
    moduleType: "lesson",
    durationMinutes: 10,
  });

  await repositories.learningModules.create(context, {
    id: "lesson_2",
    learningPathId: "path_1",
    title: "Second lesson",
    moduleType: "lesson",
    durationMinutes: 10,
  });

  await services.learning.enroll(context, "path_1");
  const afterEnroll = await services.learning.getProgress(context, "path_1");
  if (afterEnroll.status !== "in_progress" && afterEnroll.totalModules !== 2) {
    throw new Error("Enrollment did not register against the path module set.");
  }

  const result = await services.learning.completeLesson(context, "lesson_1");
  if (result.progress.status !== "completed") {
    throw new Error("completeLesson did not persist a completed status.");
  }

  const halfway = await services.learning.getProgress(context, "path_1");
  if (halfway.completedModules !== 1 || halfway.completionPercent !== 50) {
    throw new Error(`Expected 50% completion after one of two lessons, got ${halfway.completionPercent}%.`);
  }

  const twins = await repositories.studentTwins.findMany(context, { filters: { learnerUserId: "user_learning" } });
  if (twins.length !== 1 || twins[0].learningScore !== 50) {
    throw new Error("Lesson completion did not write the expected learning signal to student_twins.");
  }

  await services.learning.completeLesson(context, "lesson_2");
  const complete = await services.learning.getProgress(context, "path_1");
  if (complete.completionPercent !== 100 || complete.status !== "completed") {
    throw new Error("Path did not reach 100% completion after both lessons were completed.");
  }

  const summary = await services.learning.getLearnerSummary(context);
  if (summary.enrolledPathCount !== 1 || summary.completedLessonCount !== 2) {
    throw new Error("getLearnerSummary did not report the expected enrolled/completed counts.");
  }
}

void assertLearningWorkflowPersistsProgressAndCareerSignal();
