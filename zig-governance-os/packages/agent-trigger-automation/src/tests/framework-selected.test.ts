import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { emitDomainEvent } from "../index";
import { subject, contextFor, assert } from "./test-helpers";

async function run(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const subj = subject();
  const context = contextFor(subj);

  const envelope = await emitDomainEvent({
    domainEventType: "framework.selected",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-framework-selected",
  });

  assert(envelope.domainEventType === "framework.selected", "Expected envelope to preserve domainEventType.");
  assert(envelope.result.run.status === "succeeded", "Expected runFrameworkMappingAgent run to succeed.");
  assert(envelope.result.governance.allowed === true, "Expected governance guard to allow framework mapping.");
  assert(!!envelope.result.decision?.action, "Expected a decision action.");
  assert(runtime.listAuditTrail().length >= 1, "Expected an audit trail entry.");

  console.log("[PASS] framework.selected -> runFrameworkMappingAgent() dispatch");
}

void run();
