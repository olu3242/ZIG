import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommendReadinessScore, runReadinessScoringAgent, type ReadinessScoringInput } from "../readiness-scoring";

function subject(role: AccessSubject["user"]["role"] = "Compliance Manager"): AccessSubject {
  const user = { id: "user_1", tenantId: "tenant_1", role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<ReadinessScoringInput> = {}): ReadinessScoringInput {
  return {
    subjectId: "subject_1",
    triggeringEvent: "assessment.completed",
    framework: { frameworkCode: "soc2", coverage: 85, readiness: 85, controlCoverage: 85, evidenceCoverage: 85, gapCount: 1 },
    control: { implementation: 85, testPassRate: 85, evidenceCoverage: 85, maturity: 85, hasOpenException: false },
    learning: { knowledge: 85, practicalSkills: 85, labCompletion: 85, scenarioCompletion: 85, capstones: 85, interviewReadiness: 85 },
    organizationalMaturity: 85,
    ...overrides,
  };
}

async function assertHappyPath(): Promise<void> {
  const result = recommendReadinessScore(baseInput());
  if (result.action !== "recommend_readiness_certification_ready") {
    throw new Error("Expected high readiness signals to recommend certification readiness.");
  }
}

async function assertFailurePath(): Promise<void> {
  const result = recommendReadinessScore(
    baseInput({
      framework: { frameworkCode: "soc2", coverage: 20, readiness: 20, controlCoverage: 20, evidenceCoverage: 20, gapCount: 9 },
      control: { implementation: 20, testPassRate: 20, evidenceCoverage: 20, maturity: 20, hasOpenException: true },
      learning: { knowledge: 20, practicalSkills: 20, labCompletion: 20, scenarioCompletion: 20, capstones: 20, interviewReadiness: 20 },
      organizationalMaturity: 20,
    }),
  );
  if (result.action !== "draft_readiness_assessment" || result.weakAreas.length === 0) {
    throw new Error("Expected low readiness signals to draft a readiness assessment with weak areas flagged.");
  }
}

async function assertTenantIsolation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReadinessScoringAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_6", userId: "user_1" }, "evt_1");
  if (outcome.run.tenantId !== "tenant_6") {
    throw new Error("Expected the run record to preserve the requesting tenant.");
  }
}

async function assertRbacValidation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReadinessScoringAgent(runtime, guard, subject("Risk Manager"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_2");
  if (outcome.governance.allowed || outcome.run.status !== "failed") {
    throw new Error("Expected a Risk Manager role (no frameworks permission) to be denied and stop execution.");
  }
}

async function assertAuditLogging(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  await runReadinessScoringAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_3");
  if (runtime.listAuditTrail().length < 2 || guard.listLog().length < 1) {
    throw new Error("Expected both the runtime and governance guard to record audit entries.");
  }
}

async function assertReplayPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReadinessScoringAgent(runtime, guard, subject("Risk Manager"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_4");
  const replayed = runtime.replay(outcome.run.id);
  if (replayed.run.status !== "queued") {
    throw new Error("Expected a denied/failed run to be replayable.");
  }
}

async function assertExplainability(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReadinessScoringAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_5");
  if (!outcome.decision?.reason || !outcome.decision.dataUsed.length || outcome.decision.confidence === undefined) {
    throw new Error("Expected the decision to carry a reason, data used, and a confidence score.");
  }
}

async function assertApprovalPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReadinessScoringAgent(runtime, guard, subject(), baseInput({ requestPublish: true }), { tenantId: "tenant_1", userId: "user_1" }, "evt_6");
  if (!outcome.governance.requiresApproval || outcome.governance.escalationTarget !== "human_approver") {
    throw new Error("Expected an official readiness publication request to require human approval.");
  }
  if (outcome.recommendation?.action !== "request_readiness_publication_approval") {
    throw new Error("Expected high readiness + requestPublish to produce a publication-approval recommendation.");
  }
}

async function assertPublishRequestedButNotReady(): Promise<void> {
  const result = recommendReadinessScore(
    baseInput({
      requestPublish: true,
      framework: { frameworkCode: "soc2", coverage: 10, readiness: 10, controlCoverage: 10, evidenceCoverage: 10, gapCount: 9 },
      control: { implementation: 10, testPassRate: 10, evidenceCoverage: 10, maturity: 10, hasOpenException: true },
      learning: { knowledge: 10, practicalSkills: 10, labCompletion: 10, scenarioCompletion: 10, capstones: 10, interviewReadiness: 10 },
      organizationalMaturity: 10,
    }),
  );
  if (result.action !== "flag_readiness_gaps") {
    throw new Error("Expected a publish request from a low-readiness subject to be flagged, not approved.");
  }
}

async function run(): Promise<void> {
  await assertHappyPath();
  await assertFailurePath();
  await assertTenantIsolation();
  await assertRbacValidation();
  await assertAuditLogging();
  await assertReplayPath();
  await assertExplainability();
  await assertApprovalPath();
  await assertPublishRequestedButNotReady();
  console.log("[PASS] Readiness Scoring Agent tests");
}

void run();
