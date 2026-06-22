import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommendFrameworkMapping, runFrameworkMappingAgent, type FrameworkMappingInput } from "../framework-mapping";

function subject(role: AccessSubject["user"]["role"] = "Compliance Analyst"): AccessSubject {
  const user = { id: "user_1", tenantId: "tenant_1", role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<FrameworkMappingInput> = {}): FrameworkMappingInput {
  return {
    subjectType: "control",
    subjectId: "ctrl_1",
    frameworkCode: "iso27001_2022",
    coverage: 80,
    readiness: 80,
    controlCoverage: 80,
    evidenceCoverage: 80,
    gapCount: 1,
    ...overrides,
  };
}

async function assertHappyPath(): Promise<void> {
  const result = recommendFrameworkMapping(baseInput());
  if (result.action !== "map_control_to_framework" || result.confidence <= 0) {
    throw new Error("Expected a supported framework + control subject to produce a control mapping recommendation.");
  }
}

async function assertFailurePath(): Promise<void> {
  const result = recommendFrameworkMapping(baseInput({ frameworkCode: "nist_ai_rmf" }));
  if (result.action !== "map_unsupported_framework") {
    throw new Error("Expected an unregistered framework code to fail safely with an explicit unsupported-mapping result.");
  }
}

async function assertTenantIsolation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runFrameworkMappingAgent(
    runtime,
    guard,
    subject(),
    baseInput(),
    { tenantId: "tenant_1", userId: "user_1" },
    "evt_1",
    "control.created",
  );
  if (outcome.run.tenantId !== "tenant_1") {
    throw new Error("Expected the run record to preserve the requesting tenant.");
  }
}

async function assertRbacValidation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runFrameworkMappingAgent(
    runtime,
    guard,
    subject("Risk Analyst"),
    baseInput(),
    { tenantId: "tenant_1", userId: "user_1" },
    "evt_2",
    "control.created",
  );
  if (outcome.governance.allowed || outcome.run.status !== "failed") {
    throw new Error("Expected a Risk Analyst role (no frameworks permission) to be denied and stop execution.");
  }
}

async function assertAuditLogging(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  await runFrameworkMappingAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_3", "control.created");
  if (runtime.listAuditTrail().length < 2 || guard.listLog().length < 1) {
    throw new Error("Expected both the runtime and governance guard to record audit entries.");
  }
}

async function assertExplainability(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runFrameworkMappingAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_4", "control.created");
  if (!outcome.decision?.reason || !outcome.decision.dataUsed.length || outcome.decision.confidence === undefined) {
    throw new Error("Expected the decision to carry a reason, data used, and a confidence score.");
  }
}

async function assertReplayPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runFrameworkMappingAgent(
    runtime,
    guard,
    subject("Risk Analyst"),
    baseInput(),
    { tenantId: "tenant_1", userId: "user_1" },
    "evt_5",
    "control.created",
  );
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
  console.log("[PASS] Framework Mapping Agent tests");
}

void run();
