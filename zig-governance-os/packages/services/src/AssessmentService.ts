import { BaseService } from "./BaseService";
import type {
  LearningAssessmentQuestionRecord,
  LearningAssessmentRecord,
  LearningAssessmentResultRecord,
  StudentTwinRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";

export interface AssessmentAnswer {
  questionId: string;
  selectedOptionIndex: number;
}

export interface AssessmentAttemptResult {
  result: LearningAssessmentResultRecord;
  score: number;
  passed: boolean;
  remediationSkillIds: string[];
}

/**
 * Real assessment scoring/persistence service. Replaces the gap-report-flagged
 * AssessmentOS.composite() (averages 5 hardcoded numbers, never reads a submitted
 * answer) with logic that scores a learner's actual submitted answers against the
 * real stored correct answers in learning_assessment_questions, then persists the
 * outcome to learning_assessment_results — mirroring how LearningService delegates
 * every write to the repository layer.
 */
export class AssessmentService extends BaseService<LearningAssessmentRecord> {
  constructor(
    assessmentRepository: TenantRepository<LearningAssessmentRecord>,
    private readonly questionRepository: TenantRepository<LearningAssessmentQuestionRecord>,
    private readonly resultRepository: TenantRepository<LearningAssessmentResultRecord>,
    private readonly studentTwinRepository: TenantRepository<StudentTwinRecord>,
  ) {
    super(assessmentRepository);
  }

  /**
   * Loads an assessment plus its real question set (prompt + options, but the
   * correct-answer index is intentionally still returned here because this service
   * has no separate "exam mode" presentation layer yet — see certification doc for
   * the honesty note on this).
   */
  async findAssessment(
    context: TenantContext,
    assessmentId: string,
  ): Promise<{ assessment: LearningAssessmentRecord; questions: LearningAssessmentQuestionRecord[] } | null> {
    const assessment = await this.repository.findById(context, assessmentId);
    if (!assessment) {
      return null;
    }

    const questions = await this.questionRepository.findMany(context, { filters: { assessmentId } });
    questions.sort((a, b) => a.orderIndex - b.orderIndex);

    return { assessment, questions };
  }

  /**
   * Scores a learner's submitted answers against the real stored correct answers,
   * persists a learning_assessment_results row, and writes the resulting competency
   * signal to student_twins. No composite() call, no hardcoded numbers — score is a
   * function of (questions answered correctly * weight) / (total weight).
   */
  async submitAttempt(
    context: TenantContext,
    assessmentId: string,
    answers: AssessmentAnswer[],
  ): Promise<AssessmentAttemptResult> {
    const userId = this.requireActorUserId(context);
    const assessment = await this.repository.findById(context, assessmentId);
    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found.`);
    }

    const questions = await this.questionRepository.findMany(context, { filters: { assessmentId } });
    if (questions.length === 0) {
      throw new Error(`Assessment ${assessmentId} has no questions defined; cannot score a submission.`);
    }

    const answersByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer.selectedOptionIndex]));

    let earnedWeight = 0;
    let totalWeight = 0;
    const missedSkillIds: string[] = [];

    for (const question of questions) {
      totalWeight += question.weight;
      const selected = answersByQuestionId.get(question.id);
      if (selected !== undefined && selected === question.correctOptionIndex) {
        earnedWeight += question.weight;
      } else {
        missedSkillIds.push(question.id);
      }
    }

    const score = totalWeight === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100);
    const passed = score >= assessment.passingScore;

    const result = await this.resultRepository.create(context, {
      id: crypto.randomUUID(),
      assessmentId,
      learnerUserId: userId,
      score,
      passed,
      remediationSkillIds: missedSkillIds,
    });

    await this.updateCompetencySignal(context, score);

    return { result, score, passed, remediationSkillIds: missedSkillIds };
  }

  /**
   * Real, tenant-scoped summary for the dashboard: how many assessment attempts the
   * current actor has on record and how many passed, computed directly from
   * learning_assessment_results rows.
   */
  async getLearnerAssessmentSummary(
    context: TenantContext,
  ): Promise<{ attemptCount: number; passedCount: number; latestScore: number | null }> {
    const userId = this.requireActorUserId(context);
    const results = await this.resultRepository.findMany(context, { filters: { learnerUserId: userId } });

    return {
      attemptCount: results.length,
      passedCount: results.filter((row) => row.passed).length,
      latestScore: results.length > 0 ? results[results.length - 1].score : null,
    };
  }

  /**
   * Writes the assessment score onto student_twins.knowledgeScore — the component
   * score this workflow legitimately owns (LearningService already owns
   * learningScore/careerScore). Uses the same find-or-create pattern as
   * LearningService.updateCareerSignal.
   */
  private async updateCompetencySignal(context: TenantContext, score: number): Promise<void> {
    const userId = this.requireActorUserId(context);
    const existing = await this.studentTwinRepository.findMany(context, { filters: { learnerUserId: userId } });
    const twin = existing[0];

    if (twin) {
      await this.studentTwinRepository.update(context, twin.id, { knowledgeScore: score });
      return;
    }

    await this.studentTwinRepository.create(context, {
      id: crypto.randomUUID(),
      learnerUserId: userId,
      knowledgeScore: score,
      skillsScore: 0,
      competencyScore: 0,
      portfolioScore: 0,
      certificationScore: 0,
      careerScore: 0,
      behaviorScore: 0,
      confidenceScore: 0,
      learningScore: 0,
    });
  }

  private requireActorUserId(context: TenantContext): string {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to perform this assessment action.");
    }
    return context.actorUserId;
  }
}
