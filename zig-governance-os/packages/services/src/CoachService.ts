import { BaseService } from "./BaseService";
import { computeFrameworkCoverage, computeFrameworkGaps } from "./frameworkIntelligence";
import { computeDocumentReadiness } from "./trustIntelligence";
import type { CoachContextType } from "@zig/types";
import type {
  CoachConversationRecord,
  CoachMessageRecord,
  ControlEvidenceRecord,
  ControlRecord,
  EvidenceReviewRecord,
  FrameworkControlRecord,
  LearnerPortfolioRecord,
  RiskRecord,
  StudentTwinRecord,
  TenantContext,
  TenantRepository,
  TrustDocumentRecord,
} from "@zig/data-access";

export interface CoachReply {
  content: string;
  reasoning: string;
  supportingData: Record<string, unknown>;
  confidence: number;
  frameworkReference?: string;
}

// AI Command Center (module #9 on CLAUDE.md's canonical 11-module list) — this is a gap
// closure *within* an existing module, not a new one, so no PRD justification section is
// required (unlike Vendor/Career). Schema/integration points follow
// docs/academy/AI_COACH_ARCHITECTURE.md Section 2/4 exactly.
export class CoachService extends BaseService<CoachConversationRecord> {
  constructor(
    conversationRepository: TenantRepository<CoachConversationRecord>,
    private readonly messageRepository: TenantRepository<CoachMessageRecord>,
    private readonly riskRepository: TenantRepository<RiskRecord>,
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly studentTwinRepository: TenantRepository<StudentTwinRecord>,
    private readonly frameworkControlRepository: TenantRepository<FrameworkControlRecord>,
    private readonly controlEvidenceRepository: TenantRepository<ControlEvidenceRecord>,
    private readonly evidenceReviewRepository: TenantRepository<EvidenceReviewRecord>,
    private readonly trustDocumentRepository: TenantRepository<TrustDocumentRecord>,
    private readonly learnerPortfolioRepository: TenantRepository<LearnerPortfolioRecord>,
  ) {
    super(conversationRepository);
  }

  findConversations(context: TenantContext): Promise<CoachConversationRecord[]> {
    const userId = this.requireActorUserId(context);
    return this.repository.findMany(context, { filters: { learnerUserId: userId } });
  }

  findMessages(context: TenantContext, conversationId: string): Promise<CoachMessageRecord[]> {
    return this.messageRepository.findMany(context, { filters: { conversationId } });
  }

  async startConversation(
    context: TenantContext,
    contextType: CoachContextType,
    contextId?: string,
  ): Promise<{ conversation: CoachConversationRecord; welcomeMessage: CoachMessageRecord }> {
    const userId = this.requireActorUserId(context);
    const conversation = await this.repository.create(context, {
      id: crypto.randomUUID(),
      learnerUserId: userId,
      contextType,
      contextId,
      startedAt: new Date(),
    });

    const reply = await this.generateReply(context, "");
    const welcomeMessage = await this.messageRepository.create(context, {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      role: "coach",
      content: reply.content,
      reasoning: reply.reasoning,
      supportingData: reply.supportingData,
      confidence: reply.confidence,
      frameworkReference: reply.frameworkReference,
    });

    return { conversation, welcomeMessage };
  }

  async sendMessage(
    context: TenantContext,
    conversationId: string,
    content: string,
  ): Promise<{ learnerMessage: CoachMessageRecord; coachMessage: CoachMessageRecord }> {
    const conversation = await this.repository.findById(context, conversationId);
    if (!conversation) {
      throw new Error(`Coach conversation ${conversationId} not found.`);
    }

    const learnerMessage = await this.messageRepository.create(context, {
      id: crypto.randomUUID(),
      conversationId,
      role: "learner",
      content,
      supportingData: {},
    });

    const reply = await this.generateReply(context, content);
    const coachMessage = await this.messageRepository.create(context, {
      id: crypto.randomUUID(),
      conversationId,
      role: "coach",
      content: reply.content,
      reasoning: reply.reasoning,
      supportingData: reply.supportingData,
      confidence: reply.confidence,
      frameworkReference: reply.frameworkReference,
    });

    return { learnerMessage, coachMessage };
  }

  /**
   * Grounds every reply in real, tenant-scoped data (open risk count, control
   * implementation rate, the learner's student_twins scores) rather than calling an LLM —
   * no LLM client exists in this repo yet (docs/academy/AI_COACH_ARCHITECTURE.md Section 5
   * leaves provider selection as an open, unresolved infra question). Every reply carries
   * the explainability fields CLAUDE.md requires of any AI recommendation: reasoning,
   * supporting data, and a confidence level.
   */
  private async generateReply(context: TenantContext, learnerContent: string): Promise<CoachReply> {
    const userId = this.requireActorUserId(context);
    const [risks, controls, twins] = await Promise.all([
      this.riskRepository.findMany(context),
      this.controlRepository.findMany(context),
      this.studentTwinRepository.findMany(context, { filters: { learnerUserId: userId } }),
    ]);

    const openRiskCount = risks.filter((risk) => risk.treatment !== "mitigate" && risk.treatment !== "transfer").length;
    const implementedControlCount = controls.filter((control) => control.status === "implemented").length;
    const controlCoverage = controls.length ? Math.round((implementedControlCount / controls.length) * 100) : 0;
    const twin = twins[0];

    const trustAdvisorReply = await this.tryGenerateTrustAdvisorReply(context, learnerContent, controls);
    if (trustAdvisorReply) {
      return trustAdvisorReply;
    }

    const careerCoachReply = await this.tryGenerateCareerCoachReply(context, learnerContent, twin);
    if (careerCoachReply) {
      return careerCoachReply;
    }

    const supportingData: Record<string, unknown> = {
      openRiskCount,
      totalRiskCount: risks.length,
      controlCoverage,
      totalControlCount: controls.length,
      learnerLearningScore: twin?.learningScore ?? 0,
    };

    if (openRiskCount > 0) {
      return {
        content: `You have ${openRiskCount} open risk(s) out of ${risks.length} total. Control coverage is currently ${controlCoverage}%. Prioritize treating the open risks with the highest likelihood x impact before adding new controls.`,
        reasoning: "Open risk count and control coverage are real counts read from the risks/controls tables for this tenant, not a fixed message.",
        supportingData,
        confidence: risks.length > 0 ? 0.8 : 0.4,
        frameworkReference: "NIST CSF — Risk Assessment (ID.RA)",
      };
    }

    if (controlCoverage < 100 && controls.length > 0) {
      return {
        content: `No open risks recorded. Control coverage is ${controlCoverage}% (${implementedControlCount}/${controls.length} implemented). Close the remaining controls to improve your governance score.`,
        reasoning: "Control implementation rate computed from real control records for this tenant.",
        supportingData,
        confidence: 0.75,
        frameworkReference: "ISO 27001 — Annex A control implementation",
      };
    }

    const frameworkGapReply = await this.tryGenerateFrameworkGapReply(context, controls, supportingData);
    if (frameworkGapReply) {
      return frameworkGapReply;
    }

    return {
      content: learnerContent
        ? `Acknowledged: "${learnerContent}". No open risks and ${controlCoverage}% control coverage recorded for this tenant — your governance posture looks healthy. Ask about a specific framework or risk to go deeper.`
        : "Welcome — no open risks recorded for this tenant yet. Add a risk or generate a control to get started.",
      reasoning: "Reflects the absence of open risks and current control coverage, both real counts.",
      supportingData,
      confidence: 0.6,
    };
  }

  /**
   * Extends the existing Coach reply pipeline with a Framework Intelligence branch —
   * reuses the same computeFrameworkCoverage/computeFrameworkGaps functions
   * FrameworkCoverageService/FrameworkGapService call, rather than a separate agent.
   * Returns null (falling through to the existing healthy-state reply) when the tenant
   * has no controls assigned to a framework with a catalogued framework_controls entry.
   */
  private async tryGenerateFrameworkGapReply(
    context: TenantContext,
    controls: ControlRecord[],
    baseSupportingData: Record<string, unknown>,
  ): Promise<CoachReply | null> {
    const frameworkIds = Array.from(new Set(controls.map((control) => control.frameworkId)));
    if (frameworkIds.length === 0) {
      return null;
    }

    const [allFrameworkControls, controlEvidenceLinks, evidenceReviews] = await Promise.all([
      this.frameworkControlRepository.findMany(context),
      this.controlEvidenceRepository.findMany(context),
      this.evidenceReviewRepository.findMany(context),
    ]);

    let totalGapCount = 0;
    let referenceFrameworkId: string | undefined;
    for (const frameworkId of frameworkIds) {
      const frameworkControls = allFrameworkControls.filter((control) => control.frameworkId === frameworkId);
      if (frameworkControls.length === 0) {
        continue;
      }
      const frameworkControlsForId = controls.filter((control) => control.frameworkId === frameworkId);
      const coverage = computeFrameworkCoverage(frameworkControls, frameworkControlsForId, controlEvidenceLinks, evidenceReviews);
      const gaps = computeFrameworkGaps(coverage);
      if (gaps.length > 0 && !referenceFrameworkId) {
        referenceFrameworkId = frameworkId;
      }
      totalGapCount += gaps.length;
    }

    if (totalGapCount === 0) {
      return null;
    }

    return {
      content: `No open risks and full coverage on controls without a framework catalogue mapping, but ${totalGapCount} framework control(s) in your assigned framework(s) are missing, unimplemented, or lack approved evidence. Review the Framework Gap report to close them.`,
      reasoning: "Computed from the framework_controls catalogue crossed with this tenant's own controls/control_evidence/evidence_reviews — the same derivation FrameworkGapService exposes on the Framework Intelligence dashboard.",
      supportingData: { ...baseSupportingData, frameworkGapCount: totalGapCount },
      confidence: 0.7,
      frameworkReference: referenceFrameworkId,
    };
  }

  /**
   * AI Trust Advisor — extends the existing Coach reply pipeline rather than a separate
   * agent (Phase 11.5 spec: "Extend existing AI Coach. Do NOT create new Coach
   * framework."). Triggers on keywords tied to the six named capabilities (Questionnaire
   * Assistance, Compliance Explanation, Control Explanation, Evidence Recommendation,
   * Trust Readiness Guidance, Sales Security Support) and reuses computeFrameworkCoverage
   * plus computeDocumentReadiness from trustIntelligence.ts — the same data Trust Center
   * surfaces — rather than duplicating any calculation. Returns null to fall through when
   * the message doesn't match a trust-related intent.
   */
  private async tryGenerateTrustAdvisorReply(
    context: TenantContext,
    learnerContent: string,
    controls: ControlRecord[],
  ): Promise<CoachReply | null> {
    const text = learnerContent.toLowerCase();
    const isTrustIntent =
      /questionnaire|sig\b|caiq|trust (center|portal|readiness)|compliance status|sales security|security review|prospect|auditor/.test(
        text,
      );
    if (!text || !isTrustIntent) {
      return null;
    }

    const frameworkIds = Array.from(new Set(controls.map((control) => control.frameworkId)));
    const [allFrameworkControls, controlEvidenceLinks, evidenceReviews, documents] = await Promise.all([
      this.frameworkControlRepository.findMany(context),
      this.controlEvidenceRepository.findMany(context),
      this.evidenceReviewRepository.findMany(context),
      this.trustDocumentRepository.findMany(context),
    ]);

    const coverages = frameworkIds
      .map((frameworkId) => {
        const frameworkControls = allFrameworkControls.filter((control) => control.frameworkId === frameworkId);
        const ownControls = controls.filter((control) => control.frameworkId === frameworkId);
        if (frameworkControls.length === 0) {
          return null;
        }
        return { frameworkId, coverage: computeFrameworkCoverage(frameworkControls, ownControls, controlEvidenceLinks, evidenceReviews) };
      })
      .filter((entry): entry is { frameworkId: string; coverage: ReturnType<typeof computeFrameworkCoverage> } => entry !== null);

    const avgCoverage = coverages.length
      ? Math.round(coverages.reduce((sum, entry) => sum + entry.coverage.coveragePercent, 0) / coverages.length)
      : 0;
    const documentReadiness = computeDocumentReadiness(documents);

    const supportingData: Record<string, unknown> = {
      averageFrameworkCoveragePercent: avgCoverage,
      frameworkCount: coverages.length,
      documentReadinessPercent: documentReadiness.readinessPercent,
      missingDocumentCategories: documentReadiness.missingCategories,
    };

    return {
      content: `Trust readiness: ${avgCoverage}% average framework coverage across ${coverages.length} framework(s) and ${documentReadiness.readinessPercent}% document readiness (${documentReadiness.missingCategories.length} category gap(s)). ${
        documentReadiness.missingCategories.length > 0
          ? `Publish missing documents (${documentReadiness.missingCategories.slice(0, 3).join(", ")}) before sharing your Trust Portal with prospects or auditors.`
          : "Your document library is complete — you're ready to respond to a security questionnaire or share your Trust Portal."
      }`,
      reasoning: "Computed from this tenant's real framework coverage (computeFrameworkCoverage) and trust document set (computeDocumentReadiness) — the same functions Trust Center's Compliance Status and Document Center surface.",
      supportingData,
      confidence: coverages.length > 0 ? 0.75 : 0.5,
      frameworkReference: coverages[0]?.frameworkId,
    };
  }

  /**
   * Career OS Coach branch — per the product decision this is a sub-feature of the AI
   * Command Center, not a new module or a new Coach framework, so it extends the existing
   * reply pipeline exactly like the Trust Advisor and Framework Gap branches above.
   * Triggers on career-intent keywords and grounds its reply in the same student_twins
   * row LearningService.getCareerReadiness already reads plus the learner_portfolios row
   * PortfolioService.generateCareerMaterials writes — no separate score is invented.
   * Returns null to fall through when the message doesn't match a career intent.
   */
  private async tryGenerateCareerCoachReply(
    context: TenantContext,
    learnerContent: string,
    twin: StudentTwinRecord | undefined,
  ): Promise<CoachReply | null> {
    const text = learnerContent.toLowerCase();
    const isCareerIntent = /career|resume|r[ée]sum[ée]|linkedin|job\b|interview|portfolio readiness|hire/.test(text);
    if (!text || !isCareerIntent) {
      return null;
    }

    if (!twin) {
      return {
        content: "No career-readiness signal recorded yet — complete a lesson, assessment, or lab first, then ask me again.",
        reasoning: "No student_twins row exists yet for this learner, so there is no real readiness data to report.",
        supportingData: {},
        confidence: 0.4,
      };
    }

    const inputs = [twin.learningScore, twin.knowledgeScore, twin.skillsScore, twin.portfolioScore, twin.certificationScore];
    const readinessScore = Math.round(inputs.reduce((sum, value) => sum + value, 0) / inputs.length);

    const userId = this.requireActorUserId(context);
    const portfolios = await this.learnerPortfolioRepository.findMany(context, { filters: { learnerUserId: userId } });
    const portfolio = portfolios[0];

    const supportingData: Record<string, unknown> = {
      readinessScore,
      learningScore: twin.learningScore,
      knowledgeScore: twin.knowledgeScore,
      skillsScore: twin.skillsScore,
      portfolioScore: twin.portfolioScore,
      certificationScore: twin.certificationScore,
      hasResumeSummary: Boolean(portfolio?.resumeSummary),
    };

    if (!portfolio?.resumeSummary) {
      return {
        content: `Career readiness is ${readinessScore}/100 (average of learning, knowledge, skills, portfolio, certification scores). You don't have a generated resume/LinkedIn summary yet — visit the Career page to generate one from your real portfolio data.`,
        reasoning: "readinessScore is the same five-input average LearningService.getCareerReadiness computes; resumeSummary is read directly from learner_portfolios.",
        supportingData,
        confidence: 0.7,
      };
    }

    return {
      content: `Career readiness is ${readinessScore}/100. Your current resume summary: "${portfolio.resumeSummary}". ${
        readinessScore >= 75 ? "You're in a strong position to apply." : "Focus on raising your lowest component score before applying."
      }`,
      reasoning: "Combines the real five-input readiness average with the real resumeSummary text generated from this learner's portfolio data.",
      supportingData,
      confidence: 0.75,
    };
  }

  private requireActorUserId(context: TenantContext): string {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to use the AI Coach.");
    }
    return context.actorUserId;
  }
}
