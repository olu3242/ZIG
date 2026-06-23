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
    domainEventType: "risk.scored",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-risk-scored",
  });

  assert(envelope.result.run.status === "succeeded", "Expected runControlAdvisorAgent run to succeed.");
  assert(envelope.result.governance.allowed === true, "Expected governance guard to allow control advisory.");
  assert(!!envelope.result.decision?.reason, "Expected decision rationale.");

  console.log("[PASS] risk.scored -> runControlAdvisorAgent() dispatch");
}

void run();
