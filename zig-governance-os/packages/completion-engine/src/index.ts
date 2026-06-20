/**
 * Completion engine: defines the side-effect contract for "a lesson was just
 * marked complete." It does not perform DB I/O itself — LearningService owns
 * persistence (writing the user_progress row via packages/data-access,
 * exactly like RiskService owns writes for risks). This package's job is to
 * take the *result* of that write plus the learner's full progress set and
 * decide what the resulting career-readiness learning signal should be,
 * so the caller can persist it to student_twins.
 */

import { ProgressEngine, type ProgressRow } from "@zig/progress-engine";

export interface LessonCompletionInput {
  totalModuleIds: string[];
  progressRows: ProgressRow[];
}

export interface LearningSignal {
  /** 0-100 score representing the learner's overall learning-path completion. */
  learningScore: number;
  /** 0-100 score representing the career-readiness contribution of completed learning. */
  careerScore: number;
}

export class CompletionEngine {
  private readonly progressEngine = new ProgressEngine();

  /**
   * Derives the career/learning signal that should be written to
   * student_twins after a lesson completion. The career score is a
   * conservative real function of actual completion ratio (no hardcoded
   * average) — completion ratio is weighted at 70% toward career readiness,
   * reflecting that learning is one of several real career inputs (the
   * remaining 30% is intentionally left for portfolio/cert/behavior signals
   * that are out of scope for this workflow closure).
   */
  deriveLearningSignal(input: LessonCompletionInput): LearningSignal {
    const completion = this.progressEngine.computePathCompletion(input.totalModuleIds, input.progressRows);
    const learningScore = completion.completionPercent;
    const careerScore = Math.round(learningScore * 0.7);

    return { learningScore, careerScore };
  }
}

export type { ProgressRow } from "@zig/progress-engine";
