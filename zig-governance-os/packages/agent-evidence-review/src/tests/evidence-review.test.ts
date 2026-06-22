import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { recommend, reviewEvidence, type EvidenceReviewInput } from "../index";

function subject(overrides: Partial<AccessSubject["user"]> = {}): AccessSubject {
  const user = {
    id: "user_1",
    tenantId: "tenant_1",
    role: "Compliance Analyst" as const,
    status: "active" as const,
    ...overrides,
  };
  return { user, tenantId: user.tenantId };
}

function baseInput(overrides: Partial<EvidenceReviewInput> = {}): EvidenceReviewInput {
  return {
    domainEventType: "evidence.uploaded",
    evidenceId: "ev_1",
    controlId: "ctrl_1",
    frameworkId: "iso27001",
    exists: true,
    reviewStatus: "approved",
    ...overrides,
  };
}

async function assertCurrentEvidenceRecommendsAcceptance(): Promise<void> {
  const result = recommend(baseInput({ reviewStatus: "approved" }));
  if (result.action !== "recommend_evidence_acceptance" || result.requiresApproval) {
    throw new Error("Expected current/approved evidence to recommend acceptance without approval.");
  }
}

async function assertApprovedEvidenceRecommendsAcceptance(): Promise<void> {
  const result = recommend(baseInput({ reviewStatus: "approved", exists: true }));
  if (result.action !== "recommend_evidence_acceptance") {
    throw new Error("Expected approved evidence to recommend acceptance.");
  }
}

async function assertExpiredEvidenceRecommendsRefresh(): Promise<void> {
  const result = recommend(baseInput({ expiresAt: new Date("2000-01-01"), reviewStatus: "approved" }));
  if (result.action !== "recommend_evidence_refresh") {
    throw new Error("Expected expired evidence to recommend refresh.");
  }
}

async function assertMissingEvidenceRecommendsMissing(): Promise<void> {
  const result = recommend(baseInput({ exists: false, reviewStatus: "none" }));
  if (result.action !== "recommend_evidence_missing") {
    throw new Error("Expected missing evidence to recommend missing.");
  }
}

async function assertWeakEvidenceRecommendsRework(): Promise<void> {
  const result = recommend(baseInput({ weak: true, reviewStatus: "approved" }));
  if (result.action !== "recommend_evidence_rework") {
    throw new Error("Expected weak evidence to recommend rework.");
  }
}

async function assertRejectionRequiresApproval(): Promise<void> {
  const result = recommend(baseInput({ reviewStatus: "rejected" }));
  if (result.action !== "request_evidence_rejection_approval" || !result.requiresApproval) {
    throw new Error("Expected rejected evidence to require approval before finalizing.");
  }
}

async function assertTenantScopePreserved(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await reviewEvidence(
    runtime,
    guard,
    subject(),
    baseInput(),
    { tenantId: "tenant_1", userId: "user_1", organizationId: "org_1" },
    "evt_1",
  );
  if (outcome.run.tenantId !== "tenant_1" || outcome.run.organizationId !== "org_1") {
    throw new Error("Expected reviewEvidence() to preserve tenant/org context on the persisted run.");
  }
}

async function assertRbacDenialStopsExecution(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await reviewEvidence(
    runtime,
    guard,
    subject({ role: "Learner" }),
    baseInput(),
    { tenantId: "tenant_1", userId: "user_1" },
    "evt_2",
  );
  if (outcome.governance.allowed || outcome.run.status !== "failed" || outcome.recommendation) {
    throw new Error("Expected an unauthorized role to be denied and execution stopped before producing a recommendation.");
  }
}

async function assertDomainEventTypeRoutesCorrectly(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await reviewEvidence(
    runtime,
    guard,
    subject(),
    baseInput({ domainEventType: "control.tested", reviewStatus: "approved" }),
    { tenantId: "tenant_1", userId: "user_1" },
    "evt_3",
  );
  if (!outcome.recommendation || outcome.recommendation.action !== "recommend_evidence_acceptance") {
    throw new Error("Expected a 'control.tested' domain event to route through the same evidence-health recommendation logic.");
  }
}

async function assertGenericAgentEventTypeUnchanged(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const outcome = await reviewEvidence(runtime, guard, subject(), baseInput(), { tenantId: "tenant_1", userId: "user_1" }, "evt_4");
  if (outcome.run.status !== "succeeded") {
    throw new Error("Expected the underlying runtime run to still use the generic AgentEventType lifecycle (agent_started) unchanged.");
  }
}

async function run(): Promise<void> {
  await assertCurrentEvidenceRecommendsAcceptance();
  await assertApprovedEvidenceRecommendsAcceptance();
  await assertExpiredEvidenceRecommendsRefresh();
  await assertMissingEvidenceRecommendsMissing();
  await assertWeakEvidenceRecommendsRework();
  await assertRejectionRequiresApproval();
  await assertTenantScopePreserved();
  await assertRbacDenialStopsExecution();
  await assertDomainEventTypeRoutesCorrectly();
  await assertGenericAgentEventTypeUnchanged();
  console.log("[PASS] @zig/agent-evidence-review tests");
}

void run();
