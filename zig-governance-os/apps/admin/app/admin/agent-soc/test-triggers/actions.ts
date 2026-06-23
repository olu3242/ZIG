"use server";

import { AgentRuntime } from "@zig/agent-runtime";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AccessSubject } from "@zig/governance-engine";
import {
  emitDomainEvent,
  fixtureFailedRunRecord,
  type DomainEventType,
} from "@zig/agent-trigger-automation";

/**
 * Server action backing the Agent SOC "Test Triggers" panel. Each invocation builds a
 * fresh, in-memory AgentRuntime + AgentGovernanceGuard (this panel is a manual test harness,
 * not the production runtime singleton) and calls emitDomainEvent() — the same dispatcher
 * the trigger-automation package's own tests exercise. The panel never calls an agent
 * handler directly; emitDomainEvent() is the only entry point, so every action still goes
 * through Registry -> Governance -> Runtime -> Decision -> Audit (or, for agent.failed, the
 * documented GovernanceSupervisorAgent exception).
 */

export interface TestTriggerResult {
  domainEventType: DomainEventType;
  eventId: string;
  correlationId: string;
  status: "ok" | "error";
  summary: string;
  raw: string;
}

function platformOwnerSubject(tenantId: string): AccessSubject {
  return {
    user: { id: `admin-soc-tester:${tenantId}`, tenantId, role: "Platform Owner", status: "active" },
    tenantId,
  };
}

function summarize(domainEventType: DomainEventType, result: unknown): string {
  const r = result as Record<string, Record<string, unknown> & { run?: { id?: string; status?: string }; decision?: { action?: string }; recommendation?: { action?: string }; severity?: string; escalationRecommended?: boolean; replayRecommended?: boolean; findings?: unknown[] }>;
  switch (domainEventType) {
    case "gap.detected":
      return `policyArtifact run ${r.policyArtifact?.run?.id} (${r.policyArtifact?.run?.status}); remediation run ${r.remediation?.run?.id} (${r.remediation?.run?.status})`;
    case "module.completed":
      return `learningPath run ${r.learningPath?.run?.id} (${r.learningPath?.run?.status}); careerPortfolio run ${r.careerPortfolio?.run?.id} (${r.careerPortfolio?.run?.status})`;
    case "agent.failed":
      return `severity ${r.severity}; escalation=${r.escalationRecommended}; replay=${r.replayRecommended}; ${r.findings?.length ?? 0} finding(s)`;
    default:
      return `run ${r.run?.id} (${r.run?.status}); action ${r.decision?.action ?? r.recommendation?.action ?? "n/a"}`;
  }
}

export async function runTestTrigger(domainEventType: DomainEventType): Promise<TestTriggerResult> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const tenantId = `tenant-soc-test-${Date.now()}`;
  const subject = platformOwnerSubject(tenantId);
  const eventId = `soc-test:${domainEventType}:${Date.now()}`;
  const context = { tenantId, userId: subject.user.id, organizationId: `org-soc-test-${Date.now()}` };

  try {
    const payload =
      domainEventType === "agent.failed"
        ? {
            runs: [fixtureFailedRunRecord({ tenantId, userId: subject.user.id })],
            governanceLog: [],
            auditTrail: [],
            registeredAgentIds: ["automation"],
          }
        : undefined;

    const envelope = await emitDomainEvent({
      domainEventType,
      runtime,
      guard,
      subject,
      context,
      eventId,
      payload,
    } as Parameters<typeof emitDomainEvent>[0]);

    return {
      domainEventType,
      eventId: envelope.eventId,
      correlationId: envelope.correlationId,
      status: "ok",
      summary: summarize(domainEventType, envelope.result),
      raw: JSON.stringify(envelope.result, null, 2),
    };
  } catch (error) {
    return {
      domainEventType,
      eventId,
      correlationId: "n/a",
      status: "error",
      summary: error instanceof Error ? error.message : "Unknown error",
      raw: String(error),
    };
  }
}
