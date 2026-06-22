import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommendControlAdvice, runControlAdvisorAgent, type ControlAdvisorInput } from "../control-advisor";

function subject(role: AccessSubject["user"]["role"] = "Compliance Analyst"): AccessSubject {
  const user = { id: "user_1", tenantId: "tenant_1", role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<ControlAdvisorInput> = {}): ControlAdvisorInput {
  return {
    controlId: "ctrl_1",
    triggeringEvent: "control.requested",
    implementation: 90,
    testPassRate: 90,
    evidenceCoverage: 90,
    maturity: 90,
    hasOpenException: false,
    ...overrides,
  };
}

async function assertHappyPath(): Promise<void> {
  const result = recommendControlAdvice(baseInput());
  if (result.action !== "recommend_control_acceptance") {
    throw new Error("Expected a highly effective control to recommend acceptance.");
  }
}

async function assertFailurePath(): Promise<void> {
  const result = recommendControlAdvice(baseInput({ implementation: 0, testPassRate: 0, evidenceCoverage: 0, maturity: 0 }));
  if (result.action !== "flag_control_gap") {
    throw new Error("Expected a non-implemented control to flag a control gap.");
  }
}

async function assertTenantIsolation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runControlAdvisorAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_7", userId: "user_1" }, "evt_1");
  if (outcome.run.tenantId !== "tenant_7") {
    throw new Error("Expected the run record to preserve the requesting tenant.");
  }
}

async function assertRbacValidation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runControlAdvisorAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_2");
  if (outcome.governance.allowed || outcome.run.status !== "failed") {
    throw new Error("Expected a Learner role to be denied controls access and stop execution.");
  }
}

async function assertAuditLogging(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  await runControlAdvisorAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_3");
  if (runtime.listAuditTrail().length < 2 || guard.listLog().length < 1) {
    throw new Error("Expected both the runtime and governance guard to record audit entries.");
  }
}

async function assertExplainability(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runControlAdvisorAgent(runtime, guard, subject(), baseInput({ frameworkReference: "ISO 27001" }), { tenantId: "tenant_1", userId: "user_1" }, "evt_4");
  if (!outcome.decision?.reason || !outcome.decision.dataUsed.length || outcome.decision.confidence === undefined) {
    throw new Error("Expected the decision to carry a reason, data used, and a confidence score.");
  }
}

async function assertReplayPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runControlAdvisorAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_5");
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
  await assertExplainability();
  await assertReplayPath();
  console.log("[PASS] Control Advisor Agent tests");
}

void run();
