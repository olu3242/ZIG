import { computeEligibilityBreakdown, type CertificationTrackConfig } from "./certificationEligibility";
import type {
  CapstoneProjectRecord,
  LearningModuleRecord,
  StudentTwinRecord,
  TenantContext,
  TenantRepository,
  UserProgressRecord,
} from "@zig/data-access";

export interface CertificationProgressResult {
  status: "eligible" | "in_progress" | "missing_requirements";
  completionPercent: number;
  missingRequirements: string[];
  estimatedCompletion: string;
  recommendedNextActions: string[];
}

/**
 * Real certification-progress tracking, built on the same shared eligibility-derivation
 * function as CertificationEligibilityService (no service-to-service injection, per the
 * established factory.ts pattern — each service reads its own repositories). Adds the
 * "Estimated Completion"/"Recommended Next Actions" framing the eligibility breakdown
 * alone does not provide.
 */
export class CertificationProgressService {
  constructor(
    private readonly studentTwinRepository: TenantRepository<StudentTwinRecord>,
    private readonly userProgressRepository: TenantRepository<UserProgressRecord>,
    private readonly moduleRepository: TenantRepository<LearningModuleRecord>,
    private readonly capstoneProjectRepository: TenantRepository<CapstoneProjectRecord>,
  ) {}

  async getProgress(context: TenantContext, track: CertificationTrackConfig): Promise<CertificationProgressResult> {
    const userId = this.requireActorUserId(context);

    const [modules, progressRows, twins, capstones] = await Promise.all([
      this.moduleRepository.findMany(context, { filters: { learningPathId: track.learningPathId } }),
      this.userProgressRepository.findMany(context, { filters: { learningPathId: track.learningPathId, userId } }),
      this.studentTwinRepository.findMany(context, { filters: { learnerUserId: userId } }),
      this.capstoneProjectRepository.findMany(context, { filters: { learnerUserId: userId } }),
    ]);

    const twin = twins[0] ?? null;
    const completedLessonCount = progressRows.filter((row) => row.status === "completed" && row.lessonId).length;
    const gradedCapstones = capstones.filter((capstone) => capstone.status === "graded");

    const breakdown = computeEligibilityBreakdown({
      totalModuleCount: modules.length,
      completedLessonCount,
      knowledgeScore: twin?.knowledgeScore ?? 0,
      skillsScore: twin?.skillsScore ?? 0,
      hasGradedCapstone: gradedCapstones.length > 0,
      capstoneScore: gradedCapstones.length > 0 ? gradedCapstones[gradedCapstones.length - 1].portfolioScore : 0,
      track,
    });

    const remainingLessons = Math.max(0, modules.length - completedLessonCount);
    const recommendedNextActions: string[] = [];
    if (!breakdown.completionRequirementMet) {
      recommendedNextActions.push(`Complete ${remainingLessons} remaining lesson(s) in "${track.title}".`);
    }
    if (!breakdown.knowledgeRequirementMet) {
      recommendedNextActions.push(`Pass an assessment for "${track.title}" with a knowledge score of at least ${track.knowledgeThreshold}%.`);
    }
    if (!breakdown.skillsRequirementMet) {
      recommendedNextActions.push(`Complete a lab/simulation for "${track.title}" with a skills score of at least ${track.skillsThreshold}%.`);
    }
    if (!breakdown.capstoneRequirementMet) {
      recommendedNextActions.push(`Submit and obtain a graded capstone project scoring at least ${track.capstoneThreshold}%.`);
    }

    const estimatedCompletion = breakdown.eligible
      ? "Complete — ready to award."
      : remainingLessons > 0
        ? `${remainingLessons} lesson(s) and ${breakdown.missingRequirements.length} requirement(s) remaining.`
        : `${breakdown.missingRequirements.length} requirement(s) remaining.`;

    return {
      status: breakdown.status,
      completionPercent: breakdown.completionPercent,
      missingRequirements: breakdown.missingRequirements,
      estimatedCompletion,
      recommendedNextActions,
    };
  }

  private requireActorUserId(context: TenantContext): string {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to read certification progress.");
    }
    return context.actorUserId;
  }
}
