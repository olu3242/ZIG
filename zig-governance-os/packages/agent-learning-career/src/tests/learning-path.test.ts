import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommendLearningPath, runLearningPathAgent, type LearningPathInput } from "../learning-path";

function subject(role: AccessSubject["user"]["role"] = "Learner"): AccessSubject {
  const user = { id: "user_1", tenantId: "tenant_1", role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<LearningPathInput> = {}): LearningPathInput {
  return {
    learnerId: "learner_1",
    triggeringEvent: "module.completed",
    skillSignals: [
      { skillId: "risk_scoring", score: 90, confidence: 0.9 },
      { skillId: "control_testing", score: 85, confidence: 0.85 },
    ],
    ...overrides,
  };
}

async function assertHappyPath(): Promise<void> {
  const result = recommendLearningPath(baseInput());
  if (result.action !== "recommend_next_module") {
    throw new Error("Expected mastered skill signals to advance to the next module.");
  }
}

async function assertFailedAssessmentRemediationPath(): Promise<void> {
  const result = recommendLearningPath(
    baseInput({
      triggeringEvent: "assessment.failed",
      lastAssessment: { type: "exam", score: 40, remediationSkillIds: ["evidence_handling"] },
    }),
  );
  if (result.action !== "recommend_remediation" || result.recommendedSkillId !== "evidence_handling") {
    throw new Error("Expected a failed assessment to recommend remediation for the flagged skill.");
  }
}

async function assertFrameworkAlignmentPath(): Promise<void> {
  const result = recommendLearningPath(baseInput({ triggeringEvent: "framework.selected", frameworkCode: "iso27001_2022" }));
  if (result.frameworkReference !== "iso27001_2022") {
    throw new Error("Expected the recommendation to carry the selected framework as a reference.");
  }
}

async function assertTenantIsolation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runLearningPathAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_5", userId: "user_1" }, "evt_1");
  if (outcome.run.tenantId !== "tenant_5") {
    throw new Error("Expected the run record to preserve the requesting tenant.");
  }
}

async function assertRbacValidation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runLearningPathAgent(runtime, guard, subject("Risk Manager"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_2");
  if (outcome.governance.allowed || outcome.run.status !== "failed") {
    throw new Error("Expected a Risk Manager role (no learning permission) to be denied and stop execution.");
  }
}

async function assertAuditLogging(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  await runLearningPathAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_3");
  if (runtime.listAuditTrail().length < 2 || guard.listLog().length < 1) {
    throw new Error("Expected both the runtime and governance guard to record audit entries.");
  }
}

async function assertReplayPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runLearningPathAgent(runtime, guard, subject("Risk Manager"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_4");
  const replayed = runtime.replay(outcome.run.id);
  if (replayed.run.status !== "queued") {
    throw new Error("Expected a denied/failed run to be replayable.");
  }
}

async function assertExplainability(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runLearningPathAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_5");
  if (!outcome.decision?.reason || !outcome.decision.dataUsed.length || outcome.decision.confidence === undefined) {
    throw new Error("Expected the decision to carry a reason, data used, and a confidence score.");
  }
}

async function assertNoApprovalRequired(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runLearningPathAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_6");
  if (outcome.governance.requiresApproval) {
    throw new Error("Expected the Learning Path Agent to never require approval — it only ever drafts recommendations.");
  }
}

async function run(): Promise<void> {
  await assertHappyPath();
  await assertFailedAssessmentRemediationPath();
  await assertFrameworkAlignmentPath();
  await assertTenantIsolation();
  await assertRbacValidation();
  await assertAuditLogging();
  await assertReplayPath();
  await assertExplainability();
  await assertNoApprovalRequired();
  console.log("[PASS] Learning Path Agent tests");
}

void run();
