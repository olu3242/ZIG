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
    domainEventType: "assessment.completed",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-assessment-completed",
  });

  assert(envelope.result.run.status === "succeeded", "Expected runReadinessScoringAgent run to succeed.");
  assert(typeof envelope.result.recommendation?.aggregateReadiness === "number", "Expected an aggregate readiness score.");
  assert(runtime.listAuditTrail().length >= 1, "Expected an audit trail entry.");

  console.log("[PASS] assessment.completed -> runReadinessScoringAgent() dispatch");
}

void run();
