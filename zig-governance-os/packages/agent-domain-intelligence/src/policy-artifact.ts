import { PolicyManagementEngine, type PolicyCoverageInput, type PolicyType } from "@zig/policies";
import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest } from "@zig/agent-runtime";
import { orchestrateDomainAgent, type DomainAgentOutcome } from "./shared";

/**
 * Policy Artifact Agent — orchestrates the existing @zig/policies PolicyManagementEngine.
 * It drafts artifacts (policy/procedure/SOP/narrative/treatment plan); it never publishes
 * one. Drafting always maps to the "policy_finalization" approval action (see
 * docs/agents/ZIG_AGENT_PERMISSION_MATRIX.md) — final approval is owned by the governance
 * guard + a human approver, never auto-applied here.
 *
 * Policy artifacts are treated as the "reports" RBAC resource (the closest existing
 * approval-bearing document resource) rather than inventing a new RbacResource, since
 * @zig/governance-engine's RbacEngine has no "policies" resource of its own.
 */

export type PolicyArtifactKind = PolicyType | "narrative" | "treatment_plan";

export type PolicyArtifactAction = "draft_policy_artifact" | "flag_policy_coverage_gap";

export interface PolicyArtifactInput extends PolicyCoverageInput {
  artifactId: string;
  artifactKind: PolicyArtifactKind;
  triggeringEvent: "artifact.requested" | "gap.detected" | "control.created";
}

export interface PolicyArtifactRecommendation {
  action: PolicyArtifactAction;
  confidence: number;
  rationale: string;
  coverage: number;
  artifactKind: PolicyArtifactKind;
}

const engine = new PolicyManagementEngine();

export function recommendPolicyArtifact(input: PolicyArtifactInput): PolicyArtifactRecommendation {
  const coverage = engine.coverage(input);

  if (coverage < 70) {
    return {
      action: "flag_policy_coverage_gap",
      confidence: 0.7,
      rationale: `Policy coverage is ${coverage}%, below the 70% threshold; drafting a "${input.artifactKind}" now would not close the underlying gap.`,
      coverage,
      artifactKind: input.artifactKind,
    };
  }

  return {
    action: "draft_policy_artifact",
    confidence: 0.8,
    rationale: `Policy coverage is ${coverage}%; drafting a "${input.artifactKind}" for ${input.artifactId}. Final approval is required before publication.`,
    coverage,
    artifactKind: input.artifactKind,
  };
}

export async function runPolicyArtifactAgent(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: PolicyArtifactInput,
  context: AgentRunRequest["context"],
  eventId: string,
): Promise<DomainAgentOutcome<PolicyArtifactRecommendation>> {
  return orchestrateDomainAgent({
    runtime,
    guard,
    subject,
    agentId: "policy",
    resource: "reports",
    tool: "policy-engine",
    action: "create",
    approvalAction: "policy_finalization",
    context,
    eventId,
    domainEventType: input.triggeringEvent,
    goal: `Draft ${input.artifactKind} artifact ${input.artifactId}.`,
    payload: { ...input },
    produce: () => recommendPolicyArtifact(input),
    toDecision: (recommendation) => ({
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: [`policy_artifact:${input.artifactId}`],
      action: recommendation.action,
    }),
  });
}
