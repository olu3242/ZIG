import assert from "node:assert/strict";
import type { AgentRunRecord } from "@zig/agent-runtime";
import type { GovernanceDecisionLogEntry } from "@zig/agent-governance";
import type { RuntimeRecord } from "@zig/runtime-persistence";
import { GovernanceSupervisorAgent, computeAgentSocHealth } from "../index.js";

const supervisor = new GovernanceSupervisorAgent();

function run(overrides: Partial<AgentRunRecord> = {}): AgentRunRecord {
  return {
    id: "run-1",
    agentId: "automation",
    eventId: "evt-1",
    tenantId: "tenant-1",
    userId: "user-1",
    status: "succeeded",
    attempts: 1,
    inputSummary: "summary",
    decision: {
      agentId: "automation",
      reason: "computed score from coverage data",
      confidence: 0.9,
      dataUsed: ["assets"],
      context: { tenantId: "tenant-1", organizationId: "org-1", userId: "user-1" } as any,
      action: "score_readiness",
    } as any,
    ...overrides,
  };
}

function govEntry(overrides: Partial<GovernanceDecisionLogEntry> = {}): GovernanceDecisionLogEntry {
  return {
    outcome: "allowed",
    agentId: "automation",
    tenantId: "tenant-1",
    userId: "user-1",
    occurredAt: new Date(),
    result: {
      allowed: true,
      requiresApproval: false,
      policyViolations: [],
      auditPayload: {},
    },
    ...overrides,
  };
}

function auditRecord(entityId: string): RuntimeRecord {
  return { entityId, entityType: "agent_run", payload: {}, persistedAt: new Date() } as any;
}

// 1. Missing governance check (execution without governance / "unsafe action" detection)
{
  const r = run({ id: "run-no-gov" });
  const findings = supervisor.detectMissingGovernanceCheck([r], []);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, "missing_governance_check");
  assert.equal(findings[0].severity, "critical");
}

// 2. Missing audit
{
  const r = run({ id: "run-no-audit" });
  const findings = supervisor.detectMissingAudit([r], []);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, "missing_audit");
}

// 3. Missing tenant/org context
{
  const r = run({ id: "run-no-tenant", tenantId: "" as any });
  const findings = supervisor.detectMissingTenantContext([r]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, "missing_tenant_context");
}

// 4. Missing rationale
{
  const r = run({ id: "run-no-rationale", decision: { ...run().decision, reason: "" } as any });
  const findings = supervisor.detectMissingRationale([r]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, "missing_rationale");
}

// 5. Approval bypass (also covers readiness publication / report / policy finalization without approval)
{
  const r = run({ id: "run-bypass", decision: { ...run().decision, action: "request_readiness_publication_approval" } as any });
  const entry = govEntry({ agentId: r.agentId, tenantId: r.tenantId, result: { allowed: true, requiresApproval: false, policyViolations: [], auditPayload: {} } });
  const findings = supervisor.detectApprovalBypass([r], [entry]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, "approval_bypass");
}

// 5b. No bypass when approval was actually required
{
  const r = run({ id: "run-bypass-ok", decision: { ...run().decision, action: "request_readiness_publication_approval" } as any });
  const entry = govEntry({ agentId: r.agentId, tenantId: r.tenantId, result: { allowed: true, requiresApproval: true, policyViolations: [], auditPayload: {} } });
  const findings = supervisor.detectApprovalBypass([r], [entry]);
  assert.equal(findings.length, 0);
}

// 6. Excessive retries / failed run escalation
{
  const r = run({ id: "run-dead", status: "dead_letter", attempts: 4 });
  const findings = supervisor.detectExcessiveRetries([r]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, "excessive_retries");
}

// 7. Duplicate registration
{
  const findings = supervisor.detectDuplicateRegistration(["agent_a", "agent_b", "agent_a"]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].agentId, "agent_a");
}

// 8. Unsupported event coverage
{
  const findings = supervisor.detectUnsupportedEventCoverage(["agent.run.started", "policy.violation.detected"], [["agent.run.started"]]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].detail.includes("policy.violation.detected"), true);
}

// 9. supervise() aggregates findings and recommends escalation + replay on a failed/dead-letter run
{
  const failedRun = run({ id: "run-failed", status: "dead_letter", attempts: 5 });
  const decision = supervisor.supervise({
    runs: [failedRun],
    governanceLog: [],
    auditTrail: [],
    registeredAgentIds: ["automation"],
  });
  assert.equal(decision.severity, "critical");
  assert.equal(decision.escalationRecommended, true);
  assert.equal(decision.replayRecommended, true);
  assert.ok(decision.findings.length > 0);
}

// 10. supervise() is clean when everything is healthy
{
  const healthyRun = run({ id: "run-healthy" });
  const entry = govEntry({ agentId: healthyRun.agentId, tenantId: healthyRun.tenantId });
  const decision = supervisor.supervise({
    runs: [healthyRun],
    governanceLog: [entry],
    auditTrail: [auditRecord("run-healthy")],
    registeredAgentIds: ["automation"],
  });
  assert.equal(decision.findings.length, 0);
  assert.equal(decision.severity, "info");
  assert.equal(decision.escalationRecommended, false);
}

// 11. SOC health/telemetry computation
{
  const succeeded = run({ id: "run-a", status: "succeeded", startedAt: new Date(0), completedAt: new Date(1000) });
  const failed = run({ id: "run-b", status: "failed" });
  const entry = govEntry({ result: { allowed: true, requiresApproval: true, policyViolations: ["policy-x"], auditPayload: {} } });
  const health = computeAgentSocHealth([succeeded, failed], [entry]);
  assert.equal(health.runCount, 2);
  assert.equal(health.successRate, 0.5);
  assert.equal(health.failureRate, 0.5);
  assert.equal(health.averageLatencyMs, 1000);
  assert.equal(health.approvalCount, 1);
  assert.equal(health.policyViolationCount, 1);
  assert.equal(health.overrideCount, 1);
}

console.log("All governance-supervisor tests passed.");
