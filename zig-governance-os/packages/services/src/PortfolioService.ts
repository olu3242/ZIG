import { BaseService } from "./BaseService";
import type {
  CapstoneProjectRecord,
  LabArtifactRecord,
  LearnerPortfolioRecord,
  LearningAssessmentResultRecord,
  LearningModuleRecord,
  StudentTwinRecord,
  TenantContext,
  TenantRepository,
  UserProgressRecord,
} from "@zig/data-access";

export interface PortfolioBreakdown {
  lessonCompletionPercent: number;
  assessmentPassRatePercent: number;
  labAverageScorePercent: number;
  capstoneScorePercent: number;
  portfolioScore: number;
}

/**
 * Real portfolio scoring per docs/academy/PORTFOLIO_ENGINE_ARCHITECTURE.md. EXTEND
 * decision: capstone_projects and learner_portfolios already existed in the schema
 * (with RLS/triggers applied) but nothing ever wrote to them — this service closes that
 * gap rather than inventing new tables. Reads learner data the same way
 * LearningService/AssessmentService/ScenarioService already do (no service-to-service
 * injection, per the established factory.ts pattern) and writes the weighted result to
 * both learner_portfolios and student_twins.portfolioScore.
 */
export class PortfolioService extends BaseService<LearnerPortfolioRecord> {
  constructor(
    learnerPortfolioRepository: TenantRepository<LearnerPortfolioRecord>,
    private readonly userProgressRepository: TenantRepository<UserProgressRecord>,
    private readonly moduleRepository: TenantRepository<LearningModuleRecord>,
    private readonly assessmentResultRepository: TenantRepository<LearningAssessmentResultRecord>,
    private readonly labArtifactRepository: TenantRepository<LabArtifactRecord>,
    private readonly capstoneProjectRepository: TenantRepository<CapstoneProjectRecord>,
    private readonly studentTwinRepository: TenantRepository<StudentTwinRecord>,
  ) {
    super(learnerPortfolioRepository);
  }

  /**
   * Computes the real weighted portfolio score (30% lessons, 30% assessments, 30%
   * labs, 10% capstone, per the architecture doc), persists it to a find-or-create
   * learner_portfolios row, and writes the same value to student_twins.portfolioScore
   * — the component score this workflow owns (Learning owns learningScore/careerScore,
   * Assessments owns knowledgeScore, Scenarios owns skillsScore).
   */
  async computePortfolioScore(context: TenantContext): Promise<{ portfolio: LearnerPortfolioRecord; breakdown: PortfolioBreakdown }> {
    const userId = this.requireActorUserId(context);

    const progressRows = await this.userProgressRepository.findMany(context, { filters: { userId } });
    const completedLessonCount = progressRows.filter((row) => row.status === "completed" && row.lessonId).length;
    const learningPathIds = Array.from(new Set(progressRows.map((row) => row.learningPathId)));
    const moduleCounts = await Promise.all(
      learningPathIds.map((learningPathId) => this.moduleRepository.findMany(context, { filters: { learningPathId } })),
    );
    const totalModuleCount = moduleCounts.reduce((sum, modules) => sum + modules.length, 0);
    const lessonCompletionPercent = totalModuleCount === 0 ? 0 : Math.round((completedLessonCount / totalModuleCount) * 100);

    const assessmentResults = await this.assessmentResultRepository.findMany(context, { filters: { learnerUserId: userId } });
    const assessmentPassRatePercent =
      assessmentResults.length === 0
        ? 0
        : Math.round((assessmentResults.filter((row) => row.passed).length / assessmentResults.length) * 100);

    const labArtifacts = await this.labArtifactRepository.findMany(context);
    const labAverageScorePercent =
      labArtifacts.length === 0
        ? 0
        : Math.round(labArtifacts.reduce((sum, artifact) => sum + artifact.score, 0) / labArtifacts.length);

    const capstoneProjects = await this.capstoneProjectRepository.findMany(context, { filters: { learnerUserId: userId } });
    const capstoneScorePercent =
      capstoneProjects.length === 0
        ? 0
        : Math.round(capstoneProjects.reduce((sum, project) => sum + project.portfolioScore, 0) / capstoneProjects.length);

    const portfolioScore = Math.round(
      0.3 * lessonCompletionPercent + 0.3 * assessmentPassRatePercent + 0.3 * labAverageScorePercent + 0.1 * capstoneScorePercent,
    );

    const breakdown: PortfolioBreakdown = {
      lessonCompletionPercent,
      assessmentPassRatePercent,
      labAverageScorePercent,
      capstoneScorePercent,
      portfolioScore,
    };

    const portfolio = await this.savePortfolio(context, userId, portfolioScore);
    await this.updateCareerSignal(context, userId, portfolioScore);

    return { portfolio, breakdown };
  }

  async getPortfolio(context: TenantContext): Promise<LearnerPortfolioRecord | null> {
    const userId = this.requireActorUserId(context);
    const existing = await this.repository.findMany(context, { filters: { learnerUserId: userId } });
    return existing[0] ?? null;
  }

  /**
   * Career OS resume/LinkedIn generation, scoped as the AI Command Center's career
   * sub-feature (not a new module/service key, per the product decision). Writes real
   * text into the resumeSummary/linkedinSummary columns that have existed on
   * learner_portfolios since LEARNING_OS_E2E but were never populated — derived from the
   * same capstone_projects/lab_artifacts/portfolioScore data computePortfolioScore already
   * reads, not fabricated copy.
   */
  async generateCareerMaterials(context: TenantContext): Promise<LearnerPortfolioRecord> {
    const userId = this.requireActorUserId(context);
    const existing = await this.repository.findMany(context, { filters: { learnerUserId: userId } });
    const portfolio = existing[0];
    if (!portfolio) {
      throw new Error("Compute a portfolio score before generating career materials.");
    }

    const capstoneProjects = await this.capstoneProjectRepository.findMany(context, { filters: { learnerUserId: userId } });
    const labArtifacts = await this.labArtifactRepository.findMany(context);
    const topCapstone = capstoneProjects.sort((a, b) => b.portfolioScore - a.portfolioScore)[0];

    const resumeSummary = topCapstone
      ? `Portfolio score ${portfolio.portfolioScore}/100, led by capstone "${topCapstone.title}" (${topCapstone.portfolioScore}/100) across ${labArtifacts.length} validated lab artifacts.`
      : `Portfolio score ${portfolio.portfolioScore}/100 across ${labArtifacts.length} validated lab artifacts. No capstone project completed yet.`;

    const linkedinSummary = topCapstone
      ? `Hands-on practitioner with a verified portfolio score of ${portfolio.portfolioScore}/100 — capstone work: ${topCapstone.title}.`
      : `Hands-on practitioner building a verified portfolio (currently ${portfolio.portfolioScore}/100).`;

    const updated = await this.repository.update(context, portfolio.id, { resumeSummary, linkedinSummary });
    if (!updated) {
      throw new Error(`Failed to update portfolio ${portfolio.id}.`);
    }
    return updated;
  }

  private async savePortfolio(context: TenantContext, userId: string, portfolioScore: number): Promise<LearnerPortfolioRecord> {
    const existing = await this.repository.findMany(context, { filters: { learnerUserId: userId } });
    const existingPortfolio = existing[0];

    if (existingPortfolio) {
      const updated = await this.repository.update(context, existingPortfolio.id, { portfolioScore });
      if (!updated) {
        throw new Error(`Failed to update portfolio ${existingPortfolio.id}.`);
      }
      return updated;
    }

    return this.repository.create(context, {
      id: crypto.randomUUID(),
      learnerUserId: userId,
      validationStatus: "unvalidated",
      portfolioScore,
      resumeSummary: "",
      linkedinSummary: "",
    });
  }

  private async updateCareerSignal(context: TenantContext, userId: string, portfolioScore: number): Promise<void> {
    const existing = await this.studentTwinRepository.findMany(context, { filters: { learnerUserId: userId } });
    const twin = existing[0];

    if (twin) {
      await this.studentTwinRepository.update(context, twin.id, { portfolioScore });
      return;
    }

    await this.studentTwinRepository.create(context, {
      id: crypto.randomUUID(),
      learnerUserId: userId,
      knowledgeScore: 0,
      skillsScore: 0,
      competencyScore: 0,
      portfolioScore,
      certificationScore: 0,
      careerScore: 0,
      behaviorScore: 0,
      confidenceScore: 0,
      learningScore: 0,
    });
  }

  private requireActorUserId(context: TenantContext): string {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to compute a portfolio score.");
    }
    return context.actorUserId;
  }
}
