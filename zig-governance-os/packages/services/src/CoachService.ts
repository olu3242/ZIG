import { BaseService } from "./BaseService";
import { computeFrameworkCoverage, computeFrameworkGaps } from "./frameworkIntelligence";
import type { CoachContextType } from "@zig/types";
import type {
  CoachConversationRecord,
  CoachMessageRecord,
  ControlEvidenceRecord,
  ControlRecord,
  EvidenceReviewRecord,
  FrameworkControlRecord,
  RiskRecord,
  StudentTwinRecord,
  TenantContext,
  TenantRepository,
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

  private requireActorUserId(context: TenantContext): string {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to use the AI Coach.");
    }
    return context.actorUserId;
  }
}
