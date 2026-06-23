import { getAgentById } from "@zig/agents";
import type { AccessSubject } from "@zig/governance-engine";
import { AgentGovernanceGuard, type AgentGovernanceRequest } from "../index";

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

function evidenceAgent() {
  const agent = getAgentById("evidence");
  if (!agent) throw new Error("evidence agent must be registered");
  return agent;
}

function baseRequest(overrides: Partial<AgentGovernanceRequest> = {}): AgentGovernanceRequest {
  return {
    subject: subject(),
    agent: evidenceAgent(),
    context: { tenantId: "tenant_1", userId: "user_1", organizationId: "org_1" },
    resource: "evidence",
    action: "view",
    tool: "evidence-engine",
    ...overrides,
  };
}

async function assertAllowedExecution(): Promise<void> {
  const guard = new AgentGovernanceGuard();
  const result = guard.evaluate(baseRequest());
  if (!result.allowed || result.requiresApproval) {
    throw new Error("Expected a Compliance Analyst viewing evidence to be allowed without approval.");
  }
}

async function assertDeniedExecution(): Promise<void> {
  const guard = new AgentGovernanceGuard();
  const result = guard.evaluate(baseRequest({ subject: subject({ role: "Learner" }), action: "edit" }));
  if (result.allowed || !result.deniedReason) {
    throw new Error("Expected a Learner editing evidence to be denied with a reason.");
  }
}

async function assertTenantMismatchDenied(): Promise<void> {
  const guard = new AgentGovernanceGuard();
  const result = guard.evaluate(baseRequest({ context: { tenantId: "tenant_other", userId: "user_1" } }));
  if (result.allowed || !result.deniedReason?.includes("Tenant scope")) {
    throw new Error("Expected a tenant scope mismatch to be denied explicitly.");
  }
}

async function assertApprovalPath(): Promise<void> {
  const guard = new AgentGovernanceGuard();
  const result = guard.evaluate(
    baseRequest({ subject: subject({ role: "Auditor" }), action: "approve", approvalAction: "evidence_rejection" }),
  );
  if (!result.allowed || !result.requiresApproval || result.escalationTarget !== "human_approver") {
    throw new Error("Expected evidence rejection to be allowed but flagged as requiring human approval.");
  }
}

async function assertPolicyViolationLogging(): Promise<void> {
  const guard = new AgentGovernanceGuard();
  const result = guard.evaluate(baseRequest({ subject: subject({ role: "Platform Admin" }), action: "delete" }));
  if (result.allowed || result.policyViolations.length === 0) {
    throw new Error("Expected a delete action without an approval rule to be denied as a policy violation.");
  }
  const log = guard.listLog();
  if (log[log.length - 1].outcome !== "policy_violation") {
    throw new Error("Expected the policy violation to be logged with outcome 'policy_violation'.");
  }
}

async function assertSafeStopBehavior(): Promise<void> {
  const guard = new AgentGovernanceGuard();
  const result = guard.evaluate(baseRequest({ tool: "tool_the_agent_does_not_have" }));
  if (result.allowed) {
    throw new Error("Expected execution to stop safely when the agent lacks tool access.");
  }
}

async function assertRbacEngineCompatibility(): Promise<void> {
  const guard = new AgentGovernanceGuard();
  const viewer = subject({ role: "Viewer" });
  const result = guard.evaluate(baseRequest({ subject: viewer, action: "view" }));
  if (!result.allowed) {
    throw new Error("Expected RbacEngine's existing Viewer 'view evidence' permission to still be honored through the guard.");
  }
}

async function run(): Promise<void> {
  await assertAllowedExecution();
  await assertDeniedExecution();
  await assertTenantMismatchDenied();
  await assertApprovalPath();
  await assertPolicyViolationLogging();
  await assertSafeStopBehavior();
  await assertRbacEngineCompatibility();
  console.log("[PASS] @zig/agent-governance tests");
}

void run();
