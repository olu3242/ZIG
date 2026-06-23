import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommendRiskTreatment, runRiskAssessmentAgent, type RiskAssessmentInput } from "../risk-assessment";

function subject(role: AccessSubject["user"]["role"] = "Risk Analyst"): AccessSubject {
  const user = { id: "user_1", tenantId: "tenant_1", role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<RiskAssessmentInput> = {}): RiskAssessmentInput {
  return {
    riskId: "risk_1",
    triggeringEvent: "risk.created",
    likelihood: 5,
    impact: 5,
    controlEffectiveness: 10,
    treatmentEffectiveness: 10,
    ...overrides,
  };
}

async function assertHappyPath(): Promise<void> {
  const result = recommendRiskTreatment(baseInput());
  if (result.band !== "critical" && result.band !== "high") {
    throw new Error("Expected a high likelihood/impact, low-control risk to score critical or high.");
  }
  if (result.action !== "recommend_treatment_mitigate") {
    throw new Error("Expected a critical/high band risk to recommend mitigation.");
  }
}

async function assertFailurePath(): Promise<void> {
  const result = recommendRiskTreatment(baseInput({ likelihood: 0, impact: 0, controlEffectiveness: 100, treatmentEffectiveness: 100 }));
  if (result.band !== "informational" || result.action !== "recommend_treatment_accept") {
    throw new Error("Expected a fully mitigated, zero-likelihood risk to score informational and recommend acceptance.");
  }
}

async function assertTenantIsolation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runRiskAssessmentAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_9", userId: "user_1" }, "evt_1");
  if (outcome.run.tenantId !== "tenant_9") {
    throw new Error("Expected the run record to preserve the requesting tenant.");
  }
}

async function assertRbacValidation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runRiskAssessmentAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_2");
  if (outcome.governance.allowed || outcome.run.status !== "failed") {
    throw new Error("Expected a Learner role to be denied risk access and stop execution.");
  }
}

async function assertAuditLogging(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  await runRiskAssessmentAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_3");
  if (runtime.listAuditTrail().length < 2 || guard.listLog().length < 1) {
    throw new Error("Expected both the runtime and governance guard to record audit entries.");
  }
}

async function assertExplainability(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runRiskAssessmentAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_4");
  if (!outcome.decision?.reason || !outcome.decision.dataUsed.length || outcome.decision.confidence === undefined) {
    throw new Error("Expected the decision to carry a reason, data used, and a confidence score.");
  }
}

async function assertReplayPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runRiskAssessmentAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_5");
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
  console.log("[PASS] Risk Assessment Agent tests");
}

void run();
