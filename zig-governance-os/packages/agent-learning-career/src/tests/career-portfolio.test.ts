import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommendCareerPortfolio, runCareerPortfolioAgent, type CareerPortfolioInput } from "../career-portfolio";

function subject(role: AccessSubject["user"]["role"] = "Learner"): AccessSubject {
  const user = { id: "user_1", tenantId: "tenant_1", role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<CareerPortfolioInput> = {}): CareerPortfolioInput {
  return {
    learnerId: "learner_1",
    triggeringEvent: "readiness.updated",
    portfolioScore: 85,
    certificationReadiness: 85,
    interviewReadiness: 85,
    practicalExperience: 85,
    topSkill: "Risk Assessment",
    targetRole: "GRC Analyst",
    ...overrides,
  };
}

async function assertHappyPath(): Promise<void> {
  const result = recommendCareerPortfolio(baseInput());
  if (result.action !== "recommend_certification_readiness") {
    throw new Error("Expected high readiness signals to recommend certification readiness.");
  }
}

async function assertNotReadyRemediationPath(): Promise<void> {
  const result = recommendCareerPortfolio(
    baseInput({ portfolioScore: 20, certificationReadiness: 20, interviewReadiness: 20, practicalExperience: 20 }),
  );
  if (result.action !== "draft_portfolio_summary") {
    throw new Error("Expected low readiness signals to draft a portfolio summary instead of recommending readiness.");
  }
}

async function assertSkillMappingPath(): Promise<void> {
  const result = recommendCareerPortfolio(baseInput());
  if (!result.resumeHeadline?.includes("Risk Assessment") || !result.resumeHeadline.includes("GRC Analyst")) {
    throw new Error("Expected the resume headline to map the learner's top skill and target role.");
  }
}

async function assertTenantIsolation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runCareerPortfolioAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_6", userId: "user_1" }, "evt_1");
  if (outcome.run.tenantId !== "tenant_6") {
    throw new Error("Expected the run record to preserve the requesting tenant.");
  }
}

async function assertRbacValidation(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runCareerPortfolioAgent(runtime, guard, subject("Risk Manager"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_2");
  if (outcome.governance.allowed || outcome.run.status !== "failed") {
    throw new Error("Expected a Risk Manager role (no learning permission) to be denied and stop execution.");
  }
}

async function assertAuditLogging(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  await runCareerPortfolioAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_3");
  if (runtime.listAuditTrail().length < 2 || guard.listLog().length < 1) {
    throw new Error("Expected both the runtime and governance guard to record audit entries.");
  }
}

async function assertReplayPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runCareerPortfolioAgent(runtime, guard, subject("Risk Manager"), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_4");
  const replayed = runtime.replay(outcome.run.id);
  if (replayed.run.status !== "queued") {
    throw new Error("Expected a denied/failed run to be replayable.");
  }
}

async function assertExplainability(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runCareerPortfolioAgent(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_5");
  if (!outcome.decision?.reason || !outcome.decision.dataUsed.length || outcome.decision.confidence === undefined) {
    throw new Error("Expected the decision to carry a reason, data used, and a confidence score.");
  }
}

async function assertPublishApprovalPath(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await runCareerPortfolioAgent(
    runtime,
    guard,
    subject(),
    baseInput({ requestPublish: true }),
    { tenantId: "tenant_1", userId: "user_1" },
    "evt_6",
  );
  if (!outcome.governance.requiresApproval || outcome.governance.escalationTarget !== "human_approver") {
    throw new Error("Expected a publish/certification-claim request to always require human approval.");
  }
  if (outcome.recommendation?.action !== "request_portfolio_publish_approval") {
    throw new Error("Expected high readiness + requestPublish to produce a publish-approval recommendation.");
  }
}

async function assertPublishRequestedButNotReady(): Promise<void> {
  const result = recommendCareerPortfolio(
    baseInput({ requestPublish: true, portfolioScore: 10, certificationReadiness: 10, interviewReadiness: 10, practicalExperience: 10 }),
  );
  if (result.action !== "flag_not_ready") {
    throw new Error("Expected a publish request from a low-readiness learner to be flagged as not ready, not approved.");
  }
}

async function run(): Promise<void> {
  await assertHappyPath();
  await assertNotReadyRemediationPath();
  await assertSkillMappingPath();
  await assertTenantIsolation();
  await assertRbacValidation();
  await assertAuditLogging();
  await assertReplayPath();
  await assertExplainability();
  await assertPublishApprovalPath();
  await assertPublishRequestedButNotReady();
  console.log("[PASS] Career Portfolio Agent tests");
}

void run();
