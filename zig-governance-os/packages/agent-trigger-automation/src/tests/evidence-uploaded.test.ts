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
    domainEventType: "evidence.uploaded",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-evidence-uploaded",
  });

  assert(envelope.domainEventType === "evidence.uploaded", "Expected envelope to preserve domainEventType.");
  assert(envelope.tenantId === context.tenantId, "Expected envelope to preserve tenantId.");
  assert(!!envelope.correlationId, "Expected envelope to carry a correlation id.");
  assert(envelope.result.run.status === "succeeded", "Expected reviewEvidence run to succeed for a Platform Owner.");
  assert(envelope.result.governance.allowed === true, "Expected governance guard to allow evidence review.");
  assert(!!envelope.result.decision?.reason, "Expected decision to carry a rationale.");
  assert(runtime.listAuditTrail().length >= 1, "Expected an audit trail entry to be persisted.");
  assert(guard.listLog().length >= 1, "Expected a governance log entry to be recorded.");

  console.log("[PASS] evidence.uploaded -> reviewEvidence() dispatch");
}

void run();
