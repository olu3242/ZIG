import { computeFrameworkCoverage } from "./frameworkIntelligence";
import { generateQuestionnaireAnswer } from "./trustIntelligence";
import type {
  ControlEvidenceRecord,
  ControlRecord,
  EvidenceRecord,
  EvidenceReviewRecord,
  FrameworkControlRecord,
  FrameworkRecord,
  GovernanceScoreRecord,
  QuestionnaireAnswerRecord,
  QuestionnaireSubmissionRecord,
  QuestionnaireTemplateRecord,
  TenantContext,
  TenantRepository,
  VendorAssessmentRecord,
  VendorRecord,
} from "@zig/data-access";

/**
 * Security Questionnaire Engine. Templates carry a `templateType` enum field (sig, sig_lite,
 * caiq, hipaa_vendor, soc, custom) rather than a hardcoded code path per template, per the
 * "frameworks/templates are metadata, not separate code paths" convention. Auto-answering
 * reuses computeFrameworkCoverage (the same function FrameworkCoverageService calls) plus
 * the shared generateQuestionnaireAnswer heuristic in trustIntelligence.ts - no LLM client
 * exists in this repo (same constraint CoachService documents), so every answer is
 * deterministic and explainable (reasoning + confidence), same as CoachReply.
 */
export class QuestionnaireService {
  constructor(
    private readonly templateRepository: TenantRepository<QuestionnaireTemplateRecord>,
    private readonly submissionRepository: TenantRepository<QuestionnaireSubmissionRecord>,
    private readonly answerRepository: TenantRepository<QuestionnaireAnswerRecord>,
    private readonly frameworkRepository: TenantRepository<FrameworkRecord>,
    private readonly frameworkControlRepository: TenantRepository<FrameworkControlRecord>,
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly controlEvidenceRepository: TenantRepository<ControlEvidenceRecord>,
    private readonly evidenceReviewRepository: TenantRepository<EvidenceReviewRecord>,
    private readonly evidenceRepository: TenantRepository<EvidenceRecord>,
    private readonly vendorRepository: TenantRepository<VendorRecord>,
    private readonly vendorAssessmentRepository: TenantRepository<VendorAssessmentRecord>,
    private readonly governanceScoreRepository: TenantRepository<GovernanceScoreRecord>,
  ) {}

  findTemplates(context: TenantContext): Promise<QuestionnaireTemplateRecord[]> {
    return this.templateRepository.findMany(context);
  }

  createTemplate(
    context: TenantContext,
    input: { name: string; templateType: QuestionnaireTemplateRecord["templateType"]; questions: QuestionnaireTemplateRecord["questions"] },
  ): Promise<QuestionnaireTemplateRecord> {
    return this.templateRepository.create(context, { id: crypto.randomUUID(), ...input });
  }

  findSubmissions(context: TenantContext, projectId: string): Promise<QuestionnaireSubmissionRecord[]> {
    return this.submissionRepository.findMany(context, { filters: { projectId } });
  }

  findAnswers(context: TenantContext, submissionId: string): Promise<QuestionnaireAnswerRecord[]> {
    return this.answerRepository.findMany(context, { filters: { submissionId } });
  }

  async startSubmission(
    context: TenantContext,
    projectId: string,
    templateId: string,
    input: { requesterName: string; requesterEmail: string },
  ): Promise<QuestionnaireSubmissionRecord> {
    return this.submissionRepository.create(context, {
      id: crypto.randomUUID(),
      projectId,
      templateId,
      requesterName: input.requesterName,
      requesterEmail: input.requesterEmail,
      status: "in_progress",
    });
  }

  /**
   * Answers every question on the submission's template using live tenant data, persists
   * each as an ai_generated questionnaire_answers row, then marks the submission submitted.
   */
  async autoAnswer(context: TenantContext, submissionId: string): Promise<QuestionnaireAnswerRecord[]> {
    const submission = await this.submissionRepository.findById(context, submissionId);
    if (!submission) {
      throw new Error(`Questionnaire submission ${submissionId} not found.`);
    }
    const template = await this.templateRepository.findById(context, submission.templateId);
    if (!template) {
      throw new Error(`Questionnaire template ${submission.templateId} not found.`);
    }

    const [frameworks, frameworkControls, controls, controlEvidenceLinks, evidenceReviews, evidence, vendors, vendorAssessments, governanceScores] = await Promise.all([
      this.frameworkRepository.findMany(context),
      this.frameworkControlRepository.findMany(context),
      this.controlRepository.findMany(context, { filters: { projectId: submission.projectId } }),
      this.controlEvidenceRepository.findMany(context),
      this.evidenceReviewRepository.findMany(context),
      this.evidenceRepository.findMany(context, { filters: { projectId: submission.projectId } }),
      this.vendorRepository.findMany(context, { filters: { projectId: submission.projectId } }),
      this.vendorAssessmentRepository.findMany(context),
      this.governanceScoreRepository.findMany(context, { filters: { projectId: submission.projectId } }),
    ]);

    const frameworkCoverages = frameworks.map((framework) => {
      const ownFrameworkControls = frameworkControls.filter((control) => control.frameworkId === framework.id);
      const ownControls = controls.filter((control) => control.frameworkId === framework.id);
      const coverage = computeFrameworkCoverage(ownFrameworkControls, ownControls, controlEvidenceLinks, evidenceReviews);
      return { frameworkCode: framework.code, frameworkName: framework.name, coveragePercent: coverage.coveragePercent };
    });

    const vendorIds = new Set(vendors.map((vendor) => vendor.id));
    const vendorOpenFindingCount = vendorAssessments.filter((assessment) => vendorIds.has(assessment.vendorId) && assessment.status !== "completed").length;
    const latestGovernanceScore = governanceScores.sort((a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime())[0];

    const inputs = {
      frameworkCoverages,
      governanceScore: latestGovernanceScore?.score,
      evidenceApprovedCount: evidence.filter((row) => row.status === "approved").length,
      evidenceTotalCount: evidence.length,
      vendorCount: vendors.length,
      vendorOpenFindingCount,
    };

    const answers = await Promise.all(
      template.questions.map((question) => {
        const suggestion = generateQuestionnaireAnswer(question, inputs);
        return this.answerRepository.create(context, {
          id: crypto.randomUUID(),
          submissionId,
          questionKey: question.key,
          questionText: question.text,
          answerText: suggestion.answerText,
          aiGenerated: true,
          confidence: suggestion.confidence,
          reasoning: suggestion.reasoning,
        });
      }),
    );

    await this.submissionRepository.update(context, submissionId, { status: "submitted" });
    return answers;
  }

  async completeSubmission(context: TenantContext, submissionId: string): Promise<QuestionnaireSubmissionRecord> {
    const updated = await this.submissionRepository.update(context, submissionId, { status: "completed", completedAt: new Date() });
    if (!updated) {
      throw new Error(`Questionnaire submission ${submissionId} not found.`);
    }
    return updated;
  }
}
