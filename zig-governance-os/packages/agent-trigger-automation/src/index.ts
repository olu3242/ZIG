import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { GovernanceDecisionLogEntry } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest, AgentRunRecord } from "@zig/agent-runtime";
import type { RuntimeRecord } from "@zig/runtime-persistence";

import { reviewEvidence, type EvidenceReviewOutcome } from "@zig/agent-evidence-review";
import {
  runFrameworkMappingAgent,
  runRiskAssessmentAgent,
  runControlAdvisorAgent,
  runPolicyArtifactAgent,
  type DomainAgentOutcome,
  type FrameworkMappingRecommendation,
  type RiskAssessmentRecommendation,
  type ControlAdvisorRecommendation,
  type PolicyArtifactRecommendation,
} from "@zig/agent-domain-intelligence";
import {
  runRemediationAgent,
  type RemediationRecommendation,
  runReportingAgent,
  type ReportingRecommendation,
  runReadinessScoringAgent,
  type ReadinessScoringRecommendation,
} from "@zig/agent-execution";
import {
  runLearningPathAgent,
  type LearningPathRecommendation,
  runCareerPortfolioAgent,
  type CareerPortfolioRecommendation,
} from "@zig/agent-learning-career";
import { GovernanceSupervisorAgent, type SupervisorDecision } from "@zig/supervisor-agents";

import {
  randomId,
  fixtureEvidenceInput,
  fixtureFrameworkMappingInput,
  fixtureRiskScoreInput,
  fixtureControlAssessmentInput,
  fixturePolicyCoverageInput,
  fixtureEvidenceHealthInput,
  fixtureFrameworkReadinessInput,
  fixtureCertificationReadinessInput,
  fixtureSkillSignals,
  fixtureCareerReadinessInput,
  fixtureBoardReportInput,
} from "./fixtures";

export * from "./fixtures";

/**
 * Trigger Automation — a dispatcher layer on top of the existing per-agent functions.
 * It does NOT reimplement agent logic, RBAC, runtime persistence, or the registry: every
 * branch below calls a function that already exists in agent-domain-intelligence,
 * agent-evidence-review, agent-execution, or agent-learning-career, each of which already
 * walks Registry -> Governance -> Runtime -> Decision -> Audit via orchestrateDomainAgent()
 * or its own equivalent (agent-evidence-review's reviewEvidence()).
 *
 * The one documented exception is "agent.failed": the Governance Supervisor Agent
 * (packages/supervisor-agents) is a meta-agent that inspects already-collected
 * AgentRunRecord/GovernanceDecisionLogEntry/RuntimeRecord slices. It is not registry-resolved
 * and is not routed through AgentRuntime.submit(), so emitDomainEvent() calls
 * GovernanceSupervisorAgent.supervise() directly for that one event type only.
 */

export type DomainEventType =
  | "evidence.uploaded"
  | "framework.selected"
  | "risk.created"
  | "risk.scored"
  | "gap.detected"
  | "assessment.completed"
  | "report.requested"
  | "module.completed"
  | "lab.completed"
  | "agent.failed";

export interface EmitDomainEventInput {
  domainEventType: DomainEventType;
  runtime: AgentRuntime;
  guard: AgentGovernanceGuard;
  subject: AccessSubject;
  context: AgentRunRequest["context"];
  eventId: string;
  payload?: Record<string, unknown>;
}

export interface DomainEventEnvelope<T> {
  domainEventType: DomainEventType;
  eventId: string;
  correlationId: string;
  tenantId: string;
  organizationId?: string;
  userId: string;
  source: "trigger_automation";
  sourceId: string;
  timestamp: string;
  result: T;
}

function envelope<T>(input: EmitDomainEventInput, result: T): DomainEventEnvelope<T> {
  return {
    domainEventType: input.domainEventType,
    eventId: input.eventId,
    correlationId: crypto.randomUUID(),
    tenantId: input.context.tenantId,
    organizationId: input.context.organizationId,
    userId: input.context.userId,
    source: "trigger_automation",
    sourceId: String(input.payload?.sourceId ?? input.eventId),
    timestamp: new Date().toISOString(),
    result,
  };
}

/** Maps each canonical DomainEventType to the precise result shape its dispatch branch returns. */
export interface DomainEventResultMap {
  "evidence.uploaded": EvidenceReviewOutcome;
  "framework.selected": DomainAgentOutcome<FrameworkMappingRecommendation>;
  "risk.created": DomainAgentOutcome<RiskAssessmentRecommendation>;
  "risk.scored": DomainAgentOutcome<ControlAdvisorRecommendation>;
  "gap.detected": { policyArtifact: DomainAgentOutcome<PolicyArtifactRecommendation>; remediation: DomainAgentOutcome<RemediationRecommendation> };
  "assessment.completed": DomainAgentOutcome<ReadinessScoringRecommendation>;
  "report.requested": DomainAgentOutcome<ReportingRecommendation>;
  "module.completed": { learningPath: DomainAgentOutcome<LearningPathRecommendation>; careerPortfolio: DomainAgentOutcome<CareerPortfolioRecommendation> };
  "lab.completed": DomainAgentOutcome<CareerPortfolioRecommendation>;
  "agent.failed": SupervisorDecision;
}

export type EmitDomainEventResult = {
  [K in DomainEventType]: DomainEventEnvelope<DomainEventResultMap[K]>;
}[DomainEventType];

export interface EmitDomainEventInputFor<K extends DomainEventType> extends Omit<EmitDomainEventInput, "domainEventType"> {
  domainEventType: K;
}

/**
 * Single dispatcher entry point. Routes a canonical DomainEventType to the correct existing
 * agent function(s), filling any input fields the caller's payload omits with safe,
 * non-production fixture defaults (see ./fixtures.ts). Every branch except "agent.failed"
 * goes through AgentRuntime.submit()/execute() and AgentGovernanceGuard.evaluate() inside the
 * called agent function — this dispatcher never bypasses them itself.
 *
 * Overloaded per literal DomainEventType so callers (including tests) get the precisely
 * narrowed result shape for the event they dispatched, instead of the full result union.
 */
export async function emitDomainEvent<K extends DomainEventType>(
  input: EmitDomainEventInputFor<K>,
): Promise<DomainEventEnvelope<DomainEventResultMap[K]>>;
export async function emitDomainEvent(input: EmitDomainEventInput): Promise<EmitDomainEventResult> {
  const { domainEventType, runtime, guard, subject, context, eventId } = input;
  const payload = input.payload ?? {};

  switch (domainEventType) {
    case "evidence.uploaded": {
      const fixture = fixtureEvidenceInput();
      const result = await reviewEvidence(
        runtime,
        guard,
        subject,
        {
          domainEventType: "evidence.uploaded",
          evidenceId: (payload.evidenceId as string) ?? fixture.evidenceId,
          controlId: (payload.controlId as string) ?? fixture.controlId,
          frameworkId: (payload.frameworkId as string) ?? fixture.frameworkId,
          exists: (payload.exists as boolean) ?? fixture.exists,
          expiresAt: (payload.expiresAt as Date) ?? fixture.expiresAt,
          reviewStatus: (payload.reviewStatus as typeof fixture.reviewStatus) ?? fixture.reviewStatus,
        },
        context,
        eventId,
      );
      return envelope(input, result);
    }

    case "framework.selected": {
      const fixture = fixtureFrameworkMappingInput((payload.subjectId as string) ?? undefined);
      const result = await runFrameworkMappingAgent(
        runtime,
        guard,
        subject,
        { ...fixture, ...payload } as Parameters<typeof runFrameworkMappingAgent>[3],
        context,
        eventId,
        "framework.selected",
      );
      return envelope(input, result);
    }

    case "risk.created": {
      const result = await runRiskAssessmentAgent(
        runtime,
        guard,
        subject,
        {
          riskId: (payload.riskId as string) ?? randomId("risk"),
          triggeringEvent: "risk.created",
          ...fixtureRiskScoreInput(),
          ...payload,
        } as Parameters<typeof runRiskAssessmentAgent>[3],
        context,
        eventId,
      );
      return envelope(input, result);
    }

    case "risk.scored": {
      const result = await runControlAdvisorAgent(
        runtime,
        guard,
        subject,
        {
          controlId: (payload.controlId as string) ?? randomId("control"),
          triggeringEvent: "risk.scored",
          ...fixtureControlAssessmentInput(),
          ...payload,
        } as Parameters<typeof runControlAdvisorAgent>[3],
        context,
        eventId,
      );
      return envelope(input, result);
    }

    case "gap.detected": {
      const policyArtifact = await runPolicyArtifactAgent(
        runtime,
        guard,
        subject,
        {
          artifactId: (payload.artifactId as string) ?? randomId("artifact"),
          artifactKind: (payload.artifactKind as "policy") ?? "policy",
          triggeringEvent: "gap.detected",
          ...fixturePolicyCoverageInput(),
          ...payload,
        } as Parameters<typeof runPolicyArtifactAgent>[3],
        context,
        eventId,
      );
      const remediation = await runRemediationAgent(
        runtime,
        guard,
        subject,
        {
          subjectId: (payload.subjectId as string) ?? randomId("gap"),
          triggeringEvent: "gap.detected",
          findingSummary: (payload.findingSummary as string) ?? "Detected coverage gap requiring remediation.",
          risk: fixtureRiskScoreInput(),
          control: fixtureControlAssessmentInput(),
          evidence: fixtureEvidenceHealthInput(),
          candidateOwner: (payload.candidateOwner as string) ?? "Control Owner",
          ...payload,
        } as Parameters<typeof runRemediationAgent>[3],
        context,
        eventId,
      );
      return envelope(input, { policyArtifact, remediation });
    }

    case "assessment.completed": {
      const result = await runReadinessScoringAgent(
        runtime,
        guard,
        subject,
        {
          subjectId: (payload.subjectId as string) ?? randomId("assessment"),
          triggeringEvent: "assessment.completed",
          framework: fixtureFrameworkReadinessInput(),
          control: fixtureControlAssessmentInput(),
          learning: fixtureCertificationReadinessInput(),
          organizationalMaturity: 65,
          ...payload,
        } as Parameters<typeof runReadinessScoringAgent>[3],
        context,
        eventId,
      );
      return envelope(input, result);
    }

    case "report.requested": {
      const fixture = fixtureBoardReportInput();
      const result = await runReportingAgent(
        runtime,
        guard,
        subject,
        {
          subjectId: (payload.subjectId as string) ?? randomId("report"),
          triggeringEvent: "report.requested",
          ...fixture,
          ...payload,
        } as Parameters<typeof runReportingAgent>[3],
        context,
        eventId,
      );
      return envelope(input, result);
    }

    case "module.completed": {
      const learnerId = (payload.learnerId as string) ?? randomId("learner");
      const learningPath = await runLearningPathAgent(
        runtime,
        guard,
        subject,
        {
          learnerId,
          triggeringEvent: "module.completed",
          skillSignals: fixtureSkillSignals(),
          ...payload,
        } as Parameters<typeof runLearningPathAgent>[3],
        context,
        eventId,
      );
      const careerPortfolio = await runCareerPortfolioAgent(
        runtime,
        guard,
        subject,
        {
          learnerId,
          triggeringEvent: "module.completed",
          topSkill: (payload.topSkill as string) ?? "risk_assessment",
          targetRole: (payload.targetRole as string) ?? "Compliance Analyst",
          ...fixtureCareerReadinessInput(),
          ...payload,
        } as Parameters<typeof runCareerPortfolioAgent>[3],
        context,
        eventId,
      );
      return envelope(input, { learningPath, careerPortfolio });
    }

    case "lab.completed": {
      const result = await runCareerPortfolioAgent(
        runtime,
        guard,
        subject,
        {
          learnerId: (payload.learnerId as string) ?? randomId("learner"),
          triggeringEvent: "lab.completed",
          topSkill: (payload.topSkill as string) ?? "control_testing",
          targetRole: (payload.targetRole as string) ?? "Compliance Analyst",
          ...fixtureCareerReadinessInput(),
          ...payload,
        } as Parameters<typeof runCareerPortfolioAgent>[3],
        context,
        eventId,
      );
      return envelope(input, result);
    }

    case "agent.failed": {
      const supervisor = new GovernanceSupervisorAgent();
      const runs = (payload.runs as AgentRunRecord[]) ?? [];
      const governanceLog = (payload.governanceLog as GovernanceDecisionLogEntry[]) ?? [];
      const auditTrail = (payload.auditTrail as RuntimeRecord[]) ?? [];
      const registeredAgentIds = (payload.registeredAgentIds as string[]) ?? [];
      const result = supervisor.supervise({ runs, governanceLog, auditTrail, registeredAgentIds });
      return envelope(input, result);
    }

    default: {
      const exhaustive: never = domainEventType;
      throw new Error(`Unsupported domain event type "${exhaustive as string}".`);
    }
  }
}
