import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommendRemediation, runRemediationAgent, type RemediationInput } from "../remediation";

function subject(role: AccessSubject["user"]["role"] = "Compliance Manager"): AccessSubject {
  const user = { id: "user_1", tenantId: "tenant_1", role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<RemediationInput> = {}): RemediationInput {
  return {
    subjectId: "subject_1",
    triggeringEvent: "gap.detected",
    findingSummary: "Missing MFA enforcement on admin accounts",
    risk: { likelihood: 2, impact: 2, controlEffectiveness: 80, treatmentEffectiveness: 80 },
    control: { implementation: 80, testPassRate: 80, evidenceCoverage: 80, maturity: 80, hasOpenException: false },
    evidence: { exists: true, reviewStatus: "approved" },
    candidateOwner: "owner_1",
    ...overrides,
  };
}

async function assertHappyPath(): Promise<void> {
  const result = recommendRemediation(baseInput());
  if (result.action !== "recommend_remediation_plan") {
    throw new Error("Expected a low/medium-risk finding to recommend a standard remediation plan.");
  }
}

async function assertFailurePath(): Promise<void> {
  const result = recommendRemediation(
    baseInput({
      risk: { likelihood: 5, impact: 5, controlEffectiveness: 10, treatmentEffectiveness: 10 },
      evidence: { exists: false, reviewStatus: "none" },
    }),
  );
  if (result.action !== "request_high_risk_approval" || result.priority !== "critical") {
    throw new Error("Expected a high-likelihood, high-impact finding with missing evidence to escalate as critical.");
  }
  if (!result.dependencies.includes("evidence:missing")) {
    throw new Error("Expected missing evidence to be flagged as a remediation dependency.");
  }
}

async function assertTenantIsolation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runRemediationAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_6", userId: "user_1" }, "evt_1");
  if (outcome.run.tenantId !== "tenant_6") {
    throw new Error("Expected the run record to preserve the requesting tenant.");
  }
}

async function assertRbacValidation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runRemediationAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_2");
  if (outcome.governance.allowed || outcome.run.status !== "failed") {
    throw new Error("Expected a Learner role (no tasks permission) to be denied and stop execution.");
  }
}

async function assertAuditLogging(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  await runRemediationAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_3");
  if (runtime.listAuditTrail().length < 2 || guard.listLog().length < 1) {
    throw new Error("Expected both the runtime and governance guard to record audit entries.");
  }
}

async function assertReplayPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runRemediationAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_4");
  const replayed = runtime.replay(outcome.run.id);
  if (replayed.run.status !== "queued") {
    throw new Error("Expected a denied/failed run to be replayable.");
  }
}

async function assertExplainability(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runRemediationAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_5");
  if (!outcome.decision?.reason || !outcome.decision.dataUsed.length || outcome.decision.confidence === undefined) {
    throw new Error("Expected the decision to carry a reason, data used, and a confidence score.");
  }
}

async function assertApprovalPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runRemediationAgent(
    runtime,
    guard,
    subject(),
    baseInput({ risk: { likelihood: 5, impact: 5, controlEffectiveness: 10, treatmentEffectiveness: 10 } }),
    { tenantId: "tenant_1", userId: "user_1" },
    "evt_6",
  );
  if (!outcome.governance.requiresApproval || outcome.governance.escalationTarget !== "human_approver") {
    throw new Error("Expected a critical/high-risk finding to require human approval before remediation assignment.");
  }
  if (outcome.recommendation?.action !== "request_high_risk_approval") {
    throw new Error("Expected high-risk findings to produce a high-risk approval recommendation.");
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
  console.log("[PASS] Remediation Agent tests");
}

void run();
