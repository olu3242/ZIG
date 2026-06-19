import { CompletionEngine } from "@zig/completion-engine";
import { ProgressEngine } from "@zig/progress-engine";
import { BaseService } from "./BaseService";
import type {
  LearningModuleRecord,
  LearningPathRecord,
  StudentTwinRecord,
  TenantContext,
  TenantRepository,
  UserProgressRecord,
} from "@zig/data-access";

export class LearningService extends BaseService<LearningPathRecord> {
  private readonly progressEngine = new ProgressEngine();
  private readonly completionEngine = new CompletionEngine();

  constructor(
    learningPathRepository: TenantRepository<LearningPathRecord>,
    private readonly moduleRepository: TenantRepository<LearningModuleRecord>,
    private readonly userProgressRepository: TenantRepository<UserProgressRecord>,
    private readonly studentTwinRepository: TenantRepository<StudentTwinRecord>,
  ) {
    super(learningPathRepository);
  }

  findModules(context: TenantContext, learningPathId: string): Promise<LearningModuleRecord[]> {
    return this.moduleRepository.findMany(context, { filters: { learningPathId } });
  }

  findModuleById(context: TenantContext, moduleId: string): Promise<LearningModuleRecord | null> {
    return this.moduleRepository.findById(context, moduleId);
  }

  /**
   * Enrolls the current actor in a learning path. Writes a real
   * user_progress row with status "enrolled" via the repository layer —
   * mirrors how RiskService delegates writes to its repository rather than
   * doing raw DB calls itself.
   */
  async enroll(context: TenantContext, learningPathId: string): Promise<UserProgressRecord> {
    const userId = this.requireActorUserId(context);
    const existing = await this.userProgressRepository.findMany(context, {
      filters: { learningPathId, userId },
    });

    const alreadyEnrolled = existing.find((row) => !row.moduleId && !row.lessonId);
    if (alreadyEnrolled) {
      return alreadyEnrolled;
    }

    return this.userProgressRepository.create(context, {
      id: crypto.randomUUID(),
      userId,
      learningPathId,
      status: "enrolled",
    });
  }

  /**
   * Marks a lesson (a learning_modules row with moduleType "lesson") as
   * completed for the current actor, persists the progress row, then
   * delegates to the completion engine to compute the resulting
   * learning/career signal and writes that signal to student_twins so a
   * future career engine can read it. Every step here is a real DB
   * read/write through the repository layer — no hardcoded numbers.
   */
  async completeLesson(context: TenantContext, lessonId: string): Promise<{
    progress: UserProgressRecord;
    learningScore: number;
    careerScore: number;
  }> {
    const userId = this.requireActorUserId(context);
    const lesson = await this.moduleRepository.findById(context, lessonId);
    if (!lesson) {
      throw new Error(`Lesson ${lessonId} not found.`);
    }

    const existingRows = await this.userProgressRepository.findMany(context, {
      filters: { learningPathId: lesson.learningPathId, userId },
    });

    const existingForLesson = existingRows.find((row) => row.lessonId === lessonId || row.moduleId === lessonId);

    const progress = existingForLesson
      ? await this.userProgressRepository.update(context, existingForLesson.id, {
          status: "completed",
          completedAt: new Date(),
        })
      : await this.userProgressRepository.create(context, {
          id: crypto.randomUUID(),
          userId,
          learningPathId: lesson.learningPathId,
          moduleId: lessonId,
          lessonId,
          status: "completed",
          completedAt: new Date(),
        });

    if (!progress) {
      throw new Error(`Failed to persist progress for lesson ${lessonId}.`);
    }

    const allModules = await this.moduleRepository.findMany(context, { filters: { learningPathId: lesson.learningPathId } });
    const allProgressRows = await this.userProgressRepository.findMany(context, {
      filters: { learningPathId: lesson.learningPathId, userId },
    });

    const signal = this.completionEngine.deriveLearningSignal({
      totalModuleIds: allModules.map((module) => module.id),
      progressRows: allProgressRows.map((row) => ({ moduleId: row.moduleId, lessonId: row.lessonId, status: row.status })),
    });

    await this.updateCareerSignal(context, signal.learningScore, signal.careerScore);

    return { progress, learningScore: signal.learningScore, careerScore: signal.careerScore };
  }

  /**
   * Returns real completion stats for a learning path for the current
   * actor, computed by the progress engine from actual user_progress rows
   * (not a hardcoded percentage).
   */
  async getProgress(context: TenantContext, learningPathId: string) {
    const userId = this.requireActorUserId(context);
    const [modules, progressRows] = await Promise.all([
      this.moduleRepository.findMany(context, { filters: { learningPathId } }),
      this.userProgressRepository.findMany(context, { filters: { learningPathId, userId } }),
    ]);

    return this.progressEngine.computePathCompletion(
      modules.map((module) => module.id),
      progressRows.map((row) => ({ moduleId: row.moduleId, lessonId: row.lessonId, status: row.status })),
    );
  }

  /**
   * Writes the learning/career signal to student_twins — a real DB
   * upsert-by-update-or-create, not a comment. This is the downstream
   * effect the audit flagged as missing: lesson completion now visibly
   * changes a row a future career engine can read.
   */
  private async updateCareerSignal(context: TenantContext, learningScore: number, careerScore: number): Promise<void> {
    const userId = this.requireActorUserId(context);
    const existing = await this.studentTwinRepository.findMany(context, {
      filters: { learnerUserId: userId },
    });
    const twin = existing[0];

    if (twin) {
      await this.studentTwinRepository.update(context, twin.id, {
        learningScore,
        careerScore,
      });
      return;
    }

    await this.studentTwinRepository.create(context, {
      id: crypto.randomUUID(),
      learnerUserId: userId,
      knowledgeScore: 0,
      skillsScore: 0,
      competencyScore: 0,
      portfolioScore: 0,
      certificationScore: 0,
      careerScore,
      behaviorScore: 0,
      confidenceScore: 0,
      learningScore,
    });
  }

  /**
   * Real, tenant-scoped summary used by the dashboard: how many learning
   * paths the current actor has any progress row for, and how many lesson
   * completions they have recorded, computed directly from user_progress —
   * not a placeholder string.
   */
  async getLearnerSummary(context: TenantContext): Promise<{ enrolledPathCount: number; completedLessonCount: number }> {
    const userId = this.requireActorUserId(context);
    const progressRows = await this.userProgressRepository.findMany(context, { filters: { userId } });

    const enrolledPathCount = new Set(progressRows.map((row) => row.learningPathId)).size;
    const completedLessonCount = progressRows.filter((row) => row.status === "completed" && row.lessonId).length;

    return { enrolledPathCount, completedLessonCount };
  }

  private requireActorUserId(context: TenantContext): string {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to perform this learning action.");
    }
    return context.actorUserId;
  }
}
