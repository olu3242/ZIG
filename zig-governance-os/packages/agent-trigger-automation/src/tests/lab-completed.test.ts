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
    domainEventType: "lab.completed",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-lab-completed",
  });

  assert(envelope.result.run.status === "succeeded", "Expected runCareerPortfolioAgent run to succeed for lab.completed.");
  assert(!!envelope.result.decision?.reason, "Expected a decision rationale.");

  console.log("[PASS] lab.completed -> runCareerPortfolioAgent() dispatch");
}

void run();
