import { BaseService } from "./BaseService";
import { computeEligibilityBreakdown, type CertificationTrackConfig } from "./certificationEligibility";
import type {
  CapstoneProjectRecord,
  CertificationAwardRecord,
  LearningModuleRecord,
  StudentTwinRecord,
  TenantContext,
  TenantRepository,
  UserProgressRecord,
} from "@zig/data-access";

/**
 * Real certification-awarding and badge assignment. Per docs/academy/CERTIFICATION_MODEL.md
 * Section 3, eligibility itself is never persisted as a stale flag — but an actual award is
 * a point-in-time fact (a badge a learner earned), which the document explicitly flags as a
 * legitimate future need for a new table once one arises. certification_awards (this phase's
 * migration) is that minimal new table; certification_journeys is deliberately untouched.
 * Re-derives eligibility itself at award time (same shared computeEligibilityBreakdown used
 * by CertificationEligibilityService/CertificationProgressService) rather than trusting a
 * caller-supplied "eligible" flag, so an award can never be granted to an ineligible learner.
 */
export class CertificationAwardService extends BaseService<CertificationAwardRecord> {
  constructor(
    certificationAwardRepository: TenantRepository<CertificationAwardRecord>,
    private readonly studentTwinRepository: TenantRepository<StudentTwinRecord>,
    private readonly userProgressRepository: TenantRepository<UserProgressRecord>,
    private readonly moduleRepository: TenantRepository<LearningModuleRecord>,
    private readonly capstoneProjectRepository: TenantRepository<CapstoneProjectRecord>,
  ) {
    super(certificationAwardRepository);
  }

  async awardCertification(context: TenantContext, track: CertificationTrackConfig): Promise<CertificationAwardRecord> {
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

    if (!breakdown.eligible) {
      throw new Error(
        `Cannot award "${track.title}": learner is not eligible. Missing requirements: ${breakdown.missingRequirements.join(" ")}`,
      );
    }

    const existingAwards = await this.repository.findMany(context, {
      filters: { learnerUserId: userId, certificationKey: track.key },
    });
    if (existingAwards[0]) {
      return existingAwards[0];
    }

    const award = await this.repository.create(context, {
      id: crypto.randomUUID(),
      learnerUserId: userId,
      certificationKey: track.key,
      badgeKey: track.badgeKey,
      scoreSnapshot: { ...breakdown },
      awardedAt: new Date(),
    });

    await this.updateCertificationSignal(context, userId, breakdown.summaryScore);

    return award;
  }

  async getAwards(context: TenantContext): Promise<CertificationAwardRecord[]> {
    const userId = this.requireActorUserId(context);
    return this.repository.findMany(context, { filters: { learnerUserId: userId } });
  }

  private async updateCertificationSignal(context: TenantContext, userId: string, certificationScore: number): Promise<void> {
    const existing = await this.studentTwinRepository.findMany(context, { filters: { learnerUserId: userId } });
    const twin = existing[0];

    if (twin) {
      await this.studentTwinRepository.update(context, twin.id, { certificationScore });
      return;
    }

    await this.studentTwinRepository.create(context, {
      id: crypto.randomUUID(),
      learnerUserId: userId,
      knowledgeScore: 0,
      skillsScore: 0,
      competencyScore: 0,
      portfolioScore: 0,
      certificationScore,
      careerScore: 0,
      behaviorScore: 0,
      confidenceScore: 0,
      learningScore: 0,
    });
  }

  private requireActorUserId(context: TenantContext): string {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to award a certification.");
    }
    return context.actorUserId;
  }
}
