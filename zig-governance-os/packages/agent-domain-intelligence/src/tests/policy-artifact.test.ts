import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommendPolicyArtifact, runPolicyArtifactAgent, type PolicyArtifactInput } from "../policy-artifact";

function subject(role: AccessSubject["user"]["role"] = "GRC Manager"): AccessSubject {
  const user = { id: "user_1", tenantId: "tenant_1", role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<PolicyArtifactInput> = {}): PolicyArtifactInput {
  return {
    artifactId: "artifact_1",
    artifactKind: "policy",
    triggeringEvent: "artifact.requested",
    requiredPolicies: 10,
    publishedPolicies: 9,
    overdueReviews: 0,
    ...overrides,
  };
}

async function assertHappyPath(): Promise<void> {
  const result = recommendPolicyArtifact(baseInput());
  if (result.action !== "draft_policy_artifact") {
    throw new Error("Expected high policy coverage to draft the requested artifact.");
  }
}

async function assertFailurePath(): Promise<void> {
  const result = recommendPolicyArtifact(baseInput({ requiredPolicies: 10, publishedPolicies: 2, overdueReviews: 3 }));
  if (result.action !== "flag_policy_coverage_gap") {
    throw new Error("Expected low policy coverage to flag a coverage gap instead of drafting.");
  }
}

async function assertTenantIsolation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runPolicyArtifactAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_3", userId: "user_1" }, "evt_1");
  if (outcome.run.tenantId !== "tenant_3") {
    throw new Error("Expected the run record to preserve the requesting tenant.");
  }
}

async function assertRbacValidation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runPolicyArtifactAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_2");
  if (outcome.governance.allowed || outcome.run.status !== "failed") {
    throw new Error("Expected a Learner role to be denied report-drafting access and stop execution.");
  }
}

async function assertAuditLogging(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  await runPolicyArtifactAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_3");
  if (runtime.listAuditTrail().length < 2 || guard.listLog().length < 1) {
    throw new Error("Expected both the runtime and governance guard to record audit entries.");
  }
}

async function assertApprovalRequired(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runPolicyArtifactAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_4");
  if (!outcome.governance.requiresApproval || outcome.governance.escalationTarget !== "human_approver") {
    throw new Error("Expected drafting a policy artifact to always require human approval before finalization.");
  }
}

async function assertExplainability(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runPolicyArtifactAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_5");
  if (!outcome.decision?.reason || !outcome.decision.dataUsed.length || outcome.decision.confidence === undefined) {
    throw new Error("Expected the decision to carry a reason, data used, and a confidence score.");
  }
}

async function assertReplayPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runPolicyArtifactAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_6");
  const replayed = runtime.replay(outcome.run.id);
  if (replayed.run.status !== "queued") {
    throw new Error("Expected a denied/failed run to be replayable.");
  }
}

async function run(): Promise<void> {
  await assertHappyPath();
  await assertFailurePath();
  await assertTenantIsolation();
  await assertRbacValidation();
  await assertAuditLogging();
  await assertApprovalRequired();
  await assertExplainability();
  await assertReplayPath();
  console.log("[PASS] Policy Artifact Agent tests");
}

void run();
