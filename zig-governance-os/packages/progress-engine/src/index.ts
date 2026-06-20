/**
 * Progress engine: computes real completion metrics for a learning path from
 * user_progress rows. This package contains no DB I/O of its own — it is a
 * pure function over the rows the caller (LearningService) already fetched
 * from Supabase via the data-access repository layer. That keeps it testable
 * and keeps persistence concerns in one place (packages/data-access).
 */

export type ProgressStatus = "enrolled" | "in_progress" | "completed";

export interface ProgressRow {
  moduleId?: string;
  lessonId?: string;
  status: ProgressStatus;
}

export interface PathCompletion {
  totalModules: number;
  completedModules: number;
  completionPercent: number;
  status: ProgressStatus | "not_started";
}

export class ProgressEngine {
  /**
   * Computes the completion percentage of a learning path given:
   * - the full set of modules that belong to the path (so the denominator is real)
   * - the learner's user_progress rows for that path
   *
   * A module counts as complete if there is a progress row referencing it
   * (as moduleId or lessonId) with status "completed".
   */
  computePathCompletion(totalModuleIds: string[], progressRows: ProgressRow[]): PathCompletion {
    const totalModules = totalModuleIds.length;

    if (totalModules === 0) {
      return { totalModules: 0, completedModules: 0, completionPercent: 0, status: "not_started" };
    }

    const completedIds = new Set(
      progressRows
        .filter((row) => row.status === "completed")
        .map((row) => row.lessonId ?? row.moduleId)
        .filter((id): id is string => Boolean(id)),
    );

    const completedModules = totalModuleIds.filter((id) => completedIds.has(id)).length;
    const completionPercent = Math.round((completedModules / totalModules) * 100);

    let status: PathCompletion["status"] = "not_started";
    if (completedModules === totalModules) {
      status = "completed";
    } else if (progressRows.length > 0) {
      status = "in_progress";
    }

    return { totalModules, completedModules, completionPercent, status };
  }
}
