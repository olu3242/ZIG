import { FrameworkIntelligenceEngine, frameworkRegistry, type FrameworkCode } from "@zig/frameworks";
import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest } from "@zig/agent-runtime";
import { orchestrateDomainAgent, type DomainAgentOutcome } from "./shared";

/**
 * Framework Mapping Agent — orchestrates the existing @zig/frameworks
 * FrameworkIntelligenceEngine + frameworkRegistry. No crosswalk/scoring logic is
 * reimplemented here; this agent only explains what the existing registry/engine already
 * computed, for whichever subject (control/evidence/risk/report) triggered the mapping.
 *
 * NIST AI RMF is requested by the mission but is not yet a registered FrameworkCode in
 * @zig/frameworks — rather than inventing a parallel framework list (duplicating framework
 * mappings, which is explicitly disallowed), unsupported frameworks are reported back with
 * `map_unsupported_framework` so the gap is explicit and traceable to the registry, not
 * silently fabricated.
 */

export type FrameworkMappingSubjectType = "control" | "evidence" | "risk" | "report" | "framework_selection";

export type FrameworkMappingAction =
  | "map_control_to_framework"
  | "map_evidence_to_framework"
  | "map_risk_to_framework"
  | "map_framework_requirement"
  | "map_unsupported_framework";

export interface FrameworkMappingInput {
  subjectType: FrameworkMappingSubjectType;
  subjectId: string;
  frameworkCode: string;
  coverage: number;
  readiness: number;
  controlCoverage: number;
  evidenceCoverage: number;
  gapCount: number;
}

export interface FrameworkMappingRecommendation {
  action: FrameworkMappingAction;
  confidence: number;
  rationale: string;
  frameworkCode: string;
  frameworkName?: string;
  references: string[];
  gapCount: number;
}

const engine = new FrameworkIntelligenceEngine();

function isSupportedFrameworkCode(code: string): code is FrameworkCode {
  return frameworkRegistry.some((framework) => framework.code === code);
}

export function recommendFrameworkMapping(input: FrameworkMappingInput): FrameworkMappingRecommendation {
  if (!isSupportedFrameworkCode(input.frameworkCode)) {
    return {
      action: "map_unsupported_framework",
      confidence: 0.95,
      rationale: `"${input.frameworkCode}" is not yet a registered framework in @zig/frameworks; no mapping was fabricated.`,
      frameworkCode: input.frameworkCode,
      references: [],
      gapCount: input.gapCount,
    };
  }

  const framework = frameworkRegistry.find((entry) => entry.code === input.frameworkCode)!;
  const readiness = engine.score({
    frameworkCode: framework.code,
    coverage: input.coverage,
    readiness: input.readiness,
    controlCoverage: input.controlCoverage,
    evidenceCoverage: input.evidenceCoverage,
    gapCount: input.gapCount,
  });

  const actionBySubjectType: Record<FrameworkMappingSubjectType, FrameworkMappingAction> = {
    control: "map_control_to_framework",
    evidence: "map_evidence_to_framework",
    risk: "map_risk_to_framework",
    report: "map_framework_requirement",
    framework_selection: "map_framework_requirement",
  };

  return {
    action: actionBySubjectType[input.subjectType],
    confidence: readiness.readiness >= 75 ? 0.9 : readiness.readiness >= 50 ? 0.7 : 0.55,
    rationale: `${framework.name} ${framework.version} readiness is ${readiness.readiness}% (${readiness.health}); ` +
      `control coverage ${readiness.controlCoverage}%, evidence coverage ${readiness.evidenceCoverage}%, ${readiness.gapCount} gap(s).`,
    frameworkCode: framework.code,
    frameworkName: `${framework.name} ${framework.version}`,
    references: framework.domains,
    gapCount: readiness.gapCount,
  };
}

export async function runFrameworkMappingAgent(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: FrameworkMappingInput,
  context: AgentRunRequest["context"],
  eventId: string,
  domainEventType: string,
): Promise<DomainAgentOutcome<FrameworkMappingRecommendation>> {
  return orchestrateDomainAgent({
    runtime,
    guard,
    subject,
    agentId: "compliance",
    resource: "frameworks",
    tool: "compliance-engine",
    action: "view",
    context,
    eventId,
    domainEventType,
    goal: `Map ${input.subjectType} ${input.subjectId} to ${input.frameworkCode}.`,
    payload: { ...input },
    produce: () => recommendFrameworkMapping(input),
    toDecision: (recommendation) => ({
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: [`framework:${recommendation.frameworkCode}`, `${input.subjectType}:${input.subjectId}`],
      action: recommendation.action,
      frameworkReference: recommendation.frameworkName,
    }),
  });
}
