import { BaseService } from "./BaseService";
import type {
  CompetencyAssessmentRecord,
  CompetencyRecord,
  TenantContext,
  TenantRepository,
  UserCompetencyRecord,
} from "@zig/data-access";

export class CompetencyService extends BaseService<CompetencyRecord> {
  constructor(
    competencyRepository: TenantRepository<CompetencyRecord>,
    private readonly userCompetencyRepository: TenantRepository<UserCompetencyRecord>,
    private readonly assessmentRepository: TenantRepository<CompetencyAssessmentRecord>,
  ) {
    super(competencyRepository);
  }

  findUserCompetencies(context: TenantContext, learnerId: string): Promise<UserCompetencyRecord[]> {
    return this.userCompetencyRepository.findMany(context, { filters: { learnerId } });
  }

  async findUserCompetency(
    context: TenantContext,
    learnerId: string,
    competencyId: string,
  ): Promise<UserCompetencyRecord | null> {
    const rows = await this.userCompetencyRepository.findMany(context, { filters: { learnerId, competencyId } });
    return rows[0] ?? null;
  }

  findAssessments(
    context: TenantContext,
    learnerId: string,
    competencyId: string,
  ): Promise<CompetencyAssessmentRecord[]> {
    return this.assessmentRepository.findMany(context, { filters: { learnerId, competencyId } });
  }

  async recordAssessment(
    context: TenantContext,
    assessment: Omit<CompetencyAssessmentRecord, "id" | "tenantId" | "createdAt" | "updatedAt">,
  ): Promise<{ assessment: CompetencyAssessmentRecord; rollup: UserCompetencyRecord }> {
    const created = await this.assessmentRepository.create(context, { id: crypto.randomUUID(), ...assessment });
    const existing = await this.findUserCompetency(context, assessment.learnerId, assessment.competencyId);
    const history = await this.findAssessments(context, assessment.learnerId, assessment.competencyId);
    const assessmentCount = history.length;
    const currentScore = history.reduce((sum, a) => sum + a.overallScore, 0) / assessmentCount;
    const proficiencyLevel = created.proficiencyLevel;

    const rollupPatch = {
      id: crypto.randomUUID(),
      learnerId: assessment.learnerId,
      competencyId: assessment.competencyId,
      proficiencyLevel,
      currentScore,
      assessmentCount,
      lastAssessedAt: created.assessedAt,
      latestAssessmentId: created.id,
    };

    const rollup = existing
      ? await this.userCompetencyRepository.update(context, existing.id, rollupPatch)
      : await this.userCompetencyRepository.create(context, rollupPatch);

    return { assessment: created, rollup: rollup as UserCompetencyRecord };
  }

  findProficientLearners(
    context: TenantContext,
    competencyId: string,
    minLevel: "developing" | "proficient" | "advanced",
  ): Promise<UserCompetencyRecord[]> {
    const order: Record<string, number> = { novice: 0, developing: 1, proficient: 2, advanced: 3 };
    return this.userCompetencyRepository
      .findMany(context, { filters: { competencyId } })
      .then((rows) => rows.filter((row) => order[row.proficiencyLevel] >= order[minLevel]));
  }
}
