import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertCareerReadinessReflectsRealStudentTwinSignals(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_career", actorUserId: "user_career" };

  const noSignalYet = await services.learning.getCareerReadiness(context);
  if (noSignalYet.readinessScore !== 0 || noSignalYet.twin !== null) {
    throw new Error("Expected readinessScore 0 and no twin before any learning activity.");
  }

  await repositories.learningPaths.create(context, {
    id: "path_career",
    title: "Career Path",
    description: "Path",
    progressPercent: 0,
  });
  await repositories.learningModules.create(context, {
    id: "lesson_career",
    learningPathId: "path_career",
    title: "Lesson",
    moduleType: "lesson",
    durationMinutes: 10,
  });

  await services.learning.enroll(context, "path_career");
  await services.learning.completeLesson(context, "lesson_career");

  // --- learningScore is now 100 (1/1 lessons), other signals still 0. ---
  const partial = await services.learning.getCareerReadiness(context);
  if (!partial.twin || partial.twin.learningScore !== 100) {
    throw new Error("Expected a persisted student_twins row with learningScore 100.");
  }
  if (partial.readinessScore !== 20) {
    throw new Error(`Expected readinessScore 20 ((100+0+0+0+0)/5), got ${partial.readinessScore}.`);
  }

  // --- Manually raise knowledge/skills signals (as Assessment/Scenario closures do) and confirm the rollup is a real function of inputs. ---
  await repositories.studentTwins.update(context, partial.twin.id, {
    knowledgeScore: 80,
    skillsScore: 60,
  });

  const updated = await services.learning.getCareerReadiness(context);
  if (updated.readinessScore !== 48) {
    throw new Error(`Expected readinessScore 48 ((100+80+60+0+0)/5), got ${updated.readinessScore}.`);
  }
}

void assertCareerReadinessReflectsRealStudentTwinSignals();
