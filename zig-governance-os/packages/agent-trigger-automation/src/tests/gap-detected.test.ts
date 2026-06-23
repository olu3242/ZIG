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
    domainEventType: "gap.detected",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-gap-detected",
  });

  assert(envelope.domainEventType === "gap.detected", "Expected envelope to preserve domainEventType.");
  assert(envelope.result.policyArtifact.run.status === "succeeded", "Expected runPolicyArtifactAgent run to succeed.");
  assert(envelope.result.remediation.run.status === "succeeded", "Expected runRemediationAgent run to succeed.");

  console.log("[PASS] gap.detected -> runPolicyArtifactAgent() + runRemediationAgent() dispatch");
}

void run();
