import { EvidenceManagementEngine, type EvidenceHealth, type EvidenceHealthInput } from "@zig/evidence";
import { can, type AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard, type AgentGovernanceResult } from "@zig/agent-governance";
import { AgentRuntime, UnsupportedAgentEventError, type AgentRunRecord, type AgentRunRequest } from "@zig/agent-runtime";
import { getAgentById, type AgentDecision, type AgentDefinition } from "@zig/agents";

/**
 * Evidence Review Agent — the Phase 2D proof-of-architecture vertical slice.
 *
 * AgentEventType (from @zig/agent-ingestion, via @zig/agent-runtime) stays the generic
 * runtime lifecycle vocabulary (agent_started/completed/failed/...) and is NOT touched here.
 * DomainEventType is a business-trigger vocabulary specific to evidence review, carried as
 * payload metadata on the runtime request rather than added to the Event Fabric's enum —
 * the existing architecture (packages/agent-ingestion) has no domain-event concept yet, so
 * this is additive, not a rebuild.
 *
 * The agent recommends; it never finalizes. recommend_evidence_acceptance is a
 * recommendation for a human/approval workflow to act on — it does not call
 * EvidenceManagementEngine in a way that mutates approval state, because
 * EvidenceManagementEngine (packages/evidence) only computes health from existing inputs
 * and has no mutating "approve"/"reject" method to bypass in the first place.
 * request_evidence_rejection_approval always produces an approval requirement; it is never
 * auto-finalized by this package.
 */

export type DomainEventType = "evidence.uploaded" | "evidence.review_requested" | "control.tested";

export interface AgentRuntimePayload {
  domainEventType: DomainEventType;
  evidenceId?: string;
  controlId?: string;
  frameworkId?: string;
  organizationId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export type EvidenceReviewAction =
  | "recommend_evidence_acceptance"
  | "recommend_evidence_refresh"
  | "recommend_evidence_missing"
  | "recommend_evidence_rework"
  | "request_evidence_rejection_approval";

export interface EvidenceReviewRecommendation {
  action: EvidenceReviewAction;
  confidence: number;
  requiresApproval: boolean;
  rationale: string;
  evidenceHealth: EvidenceHealth;
  evidenceId?: string;
  frameworkReference?: string;
  controlReference?: string;
  nextSteps: string[];
}

export interface EvidenceReviewInput extends EvidenceHealthInput {
  domainEventType: DomainEventType;
  evidenceId?: string;
  controlId?: string;
  frameworkId?: string;
  /** Set when the evidence engine's health signal alone is insufficient (e.g. partial framework mapping). */
  weak?: boolean;
}

const engine = new EvidenceManagementEngine();

/** Domain trigger -> minimum review action the agent is willing to recommend without further signal. */
export function routeDomainEvent(domainEventType: DomainEventType): EvidenceReviewAction | undefined {
  if (domainEventType === "control.tested") {
    return undefined; // routed by evidence health only — no fixed floor action.
  }
  return undefined;
}

export function recommend(input: EvidenceReviewInput, now = new Date()): EvidenceReviewRecommendation {
  const health = engine.health(
    { exists: input.exists, expiresAt: input.expiresAt, reviewStatus: input.reviewStatus },
    now,
  );

  const base = {
    evidenceHealth: health,
    evidenceId: input.evidenceId,
    frameworkReference: input.frameworkId,
    controlReference: input.controlId,
  };

  if (input.reviewStatus === "rejected") {
    return {
      ...base,
      action: "request_evidence_rejection_approval",
      confidence: 0.4,
      requiresApproval: true,
      rationale: "Evidence was already marked rejected; finalizing rejection requires human approval.",
      nextSteps: ["Route to approver", "Await approval decision before closing the control task"],
    };
  }

  if (health === "missing") {
    return {
      ...base,
      action: "recommend_evidence_missing",
      confidence: 0.85,
      requiresApproval: false,
      rationale: "No evidence artifact exists for this control requirement.",
      nextSteps: ["Request evidence upload from the asset owner"],
    };
  }

  if (health === "expired") {
    return {
      ...base,
      action: "recommend_evidence_refresh",
      confidence: 0.7,
      requiresApproval: false,
      rationale: "Evidence has expired and no longer satisfies the control's currency requirement.",
      nextSteps: ["Request a refreshed evidence artifact", "Flag the control as needing evidence"],
    };
  }

  if (input.weak || health === "pending_review") {
    return {
      ...base,
      action: "recommend_evidence_rework",
      confidence: 0.55,
      requiresApproval: false,
      rationale: health === "pending_review"
        ? "Evidence is present but still awaiting review and may need rework before acceptance."
        : "Evidence is present but maps weakly to the framework requirement; rework recommended.",
      nextSteps: ["Request additional context or a stronger artifact", "Re-run review once updated"],
    };
  }

  // health is "current" or "approved"
  return {
    ...base,
    action: "recommend_evidence_acceptance",
    confidence: 0.9,
    requiresApproval: false,
    rationale: `Evidence health is "${health}"; meets currency and review requirements.`,
    nextSteps: ["No action required unless the control owner requests re-verification"],
  };
}

export interface EvidenceReviewOutcome {
  run: AgentRunRecord;
  governance: AgentGovernanceResult;
  recommendation?: EvidenceReviewRecommendation;
  decision?: AgentDecision;
}

/**
 * End-to-end vertical slice: Event -> Registry -> Governance Guard -> Handler -> Runtime
 * Persistence -> Approval Request if needed -> Audit. Mirrors AgentRuntime.submit/execute
 * exactly — no parallel runtime is created here.
 */
export async function reviewEvidence(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: EvidenceReviewInput,
  context: AgentRunRequest["context"],
  eventId: string,
): Promise<EvidenceReviewOutcome> {
  const agent = getAgentById("evidence");
  if (!agent) {
    throw new UnsupportedAgentEventError('No "evidence" agent is registered.');
  }

  const request: AgentRunRequest = {
    eventId,
    source: "compliance_runtime",
    type: "agent_started",
    context,
    goal: `Review evidence ${input.evidenceId ?? "(unknown)"} for domain event "${input.domainEventType}".`,
    payload: {
      domainEventType: input.domainEventType,
      evidenceId: input.evidenceId,
      controlId: input.controlId,
      frameworkId: input.frameworkId,
      organizationId: context.organizationId ?? "",
      userId: context.userId,
    } satisfies AgentRuntimePayload,
    agentId: "evidence",
  };

  const { run, job } = runtime.submit(request);

  const governance = guard.evaluate({
    subject,
    agent,
    context,
    resource: "evidence",
    action: "view",
    tool: "evidence-engine",
  });

  if (!governance.allowed) {
    const stopped = await runtime.execute(run.id, job.id, request, agent, async () => {
      throw new Error(governance.deniedReason ?? "Governance denied evidence review execution.");
    });
    return { run: stopped, governance };
  }

  const completed = await runtime.execute(run.id, job.id, request, agent, async () => {
    const recommendation = recommend(input);
    return {
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: recommendation.evidenceId ? [`evidence:${recommendation.evidenceId}`] : [],
      action: recommendation.action,
      frameworkReference: recommendation.frameworkReference,
      sourceReference: recommendation.controlReference,
    };
  });

  const recommendation = recommend(input);

  let rejectionGovernance = governance;
  if (recommendation.action === "request_evidence_rejection_approval") {
    rejectionGovernance = guard.evaluate({
      subject,
      agent,
      context,
      resource: "evidence",
      action: "approve",
      tool: "evidence-engine",
      approvalAction: "evidence_rejection",
    });
  }

  return {
    run: completed,
    governance: rejectionGovernance,
    recommendation,
    decision: completed.decision,
  };
}

export function canReviewEvidence(subject: AccessSubject): boolean {
  return can(subject, "evidence", "view");
}

export type { AgentDefinition };
