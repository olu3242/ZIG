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
    domainEventType: "report.requested",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-report-requested",
  });

  assert(envelope.result.run.status === "succeeded", "Expected runReportingAgent run to succeed.");
  assert(!!envelope.result.recommendation?.narrative, "Expected a narrative on the reporting recommendation.");

  console.log("[PASS] report.requested -> runReportingAgent() dispatch");
}

void run();
