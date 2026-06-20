import { computeEligibilityBreakdown, type CertificationEligibilityBreakdown, type CertificationTrackConfig } from "./certificationEligibility";
import type {
  CapstoneProjectRecord,
  LearningModuleRecord,
  StudentTwinRecord,
  TenantContext,
  TenantRepository,
  UserProgressRecord,
} from "@zig/data-access";

/**
 * Real certification-eligibility derivation per docs/academy/CERTIFICATION_MODEL.md
 * Section 2: computed at read time from existing student_twins/user_progress/
 * capstone_projects signals, not persisted as an opaque flag. EXTEND decision:
 * certification_journeys (202606180008) is deliberately left untouched, per the same
 * document and the prior LEARNING_WORKFLOW_CERTIFICATION.md boundary. Not a BaseService
 * subclass: this service owns no table of its own, only derives a value from others'.
 */
export class CertificationEligibilityService {
  constructor(
    private readonly studentTwinRepository: TenantRepository<StudentTwinRecord>,
    private readonly userProgressRepository: TenantRepository<UserProgressRecord>,
    private readonly moduleRepository: TenantRepository<LearningModuleRecord>,
    private readonly capstoneProjectRepository: TenantRepository<CapstoneProjectRecord>,
  ) {}

  async evaluateEligibility(context: TenantContext, track: CertificationTrackConfig): Promise<CertificationEligibilityBreakdown> {
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

    return computeEligibilityBreakdown({
      totalModuleCount: modules.length,
      completedLessonCount,
      knowledgeScore: twin?.knowledgeScore ?? 0,
      skillsScore: twin?.skillsScore ?? 0,
      hasGradedCapstone: gradedCapstones.length > 0,
      capstoneScore: gradedCapstones.length > 0 ? gradedCapstones[gradedCapstones.length - 1].portfolioScore : 0,
      track,
    });
  }

  private requireActorUserId(context: TenantContext): string {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to evaluate certification eligibility.");
    }
    return context.actorUserId;
  }
}
