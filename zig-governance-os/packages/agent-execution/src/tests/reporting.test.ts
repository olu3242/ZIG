import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommendReport, runReportingAgent, type ReportingInput } from "../reporting";

function subject(role: AccessSubject["user"]["role"] = "Compliance Manager"): AccessSubject {
  const user = { id: "user_1", tenantId: "tenant_1", role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<ReportingInput> = {}): ReportingInput {
  return {
    subjectId: "subject_1",
    triggeringEvent: "report.requested",
    reportType: "compliance",
    outputs: ["pdf", "dashboard"],
    aggregateReadiness: 82,
    weakAreas: [],
    ...overrides,
  };
}

async function assertHappyPath(): Promise<void> {
  const result = recommendReport(baseInput());
  if (result.action !== "generate_report") {
    throw new Error("Expected a non-official report request to generate a report directly.");
  }
}

async function assertFailurePath(): Promise<void> {
  const result = recommendReport(baseInput({ aggregateReadiness: 30, weakAreas: ["controls", "evidence"] }));
  if (!result.narrative.includes("controls") || !result.narrative.includes("evidence")) {
    throw new Error("Expected weak areas to be reflected in the report narrative.");
  }
}

async function assertTenantIsolation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReportingAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_6", userId: "user_1" }, "evt_1");
  if (outcome.run.tenantId !== "tenant_6") {
    throw new Error("Expected the run record to preserve the requesting tenant.");
  }
}

async function assertRbacValidation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReportingAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_2");
  if (outcome.governance.allowed || outcome.run.status !== "failed") {
    throw new Error("Expected a Learner role (no reports permission) to be denied and stop execution.");
  }
}

async function assertAuditLogging(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  await runReportingAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_3");
  if (runtime.listAuditTrail().length < 2 || guard.listLog().length < 1) {
    throw new Error("Expected both the runtime and governance guard to record audit entries.");
  }
}

async function assertReplayPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReportingAgent(runtime, guard, subject("Learner"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_4");
  const replayed = runtime.replay(outcome.run.id);
  if (replayed.run.status !== "queued") {
    throw new Error("Expected a denied/failed run to be replayable.");
  }
}

async function assertExplainability(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReportingAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_5");
  if (!outcome.decision?.reason || !outcome.decision.dataUsed.length || outcome.decision.confidence === undefined) {
    throw new Error("Expected the decision to carry a reason, data used, and a confidence score.");
  }
}

async function assertApprovalPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runReportingAgent(runtime, guard, subject(), baseInput({ isOfficial: true }), { tenantId: "tenant_1", userId: "user_1" }, "evt_6");
  if (!outcome.governance.requiresApproval || outcome.governance.escalationTarget !== "human_approver") {
    throw new Error("Expected an official report request to require human approval before publication.");
  }
  if (outcome.recommendation?.action !== "request_report_publication_approval") {
    throw new Error("Expected an official report request to produce a publication-approval recommendation.");
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
  console.log("[PASS] Reporting Agent tests");
}

void run();
