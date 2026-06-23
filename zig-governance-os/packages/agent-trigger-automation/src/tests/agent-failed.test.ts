import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { emitDomainEvent } from "../index";
import { fixtureFailedRunRecord } from "../fixtures";
import { subject, contextFor, assert } from "./test-helpers";

/**
 * agent.failed is the documented exception: it calls GovernanceSupervisorAgent.supervise()
 * directly rather than routing through AgentRuntime.submit()/AgentGovernanceGuard.evaluate(),
 * because the supervisor is a meta-agent that inspects already-collected records rather than
 * producing a new agent run itself. This test proves the dispatcher wires that exception
 * correctly and that the supervisor decision surfaces escalation/replay recommendations for
 * a dead-lettered run with no matching governance log entry.
 */
async function run(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const subj = subject();
  const context = contextFor(subj);

  const failedRun = fixtureFailedRunRecord({ tenantId: context.tenantId, userId: context.userId });

  const envelope = await emitDomainEvent({
    domainEventType: "agent.failed",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-agent-failed",
    payload: {
      runs: [failedRun],
      governanceLog: [],
      auditTrail: [],
      registeredAgentIds: [failedRun.agentId],
    },
  });

  assert(envelope.domainEventType === "agent.failed", "Expected envelope to preserve domainEventType.");
  assert(envelope.result.severity === "critical", "Expected a dead-lettered run with no governance/audit coverage to be critical severity.");
  assert(envelope.result.escalationRecommended === true, "Expected escalation to be recommended.");
  assert(envelope.result.replayRecommended === true, "Expected replay to be recommended for the excessive-retries finding.");
  assert(envelope.result.findings.some((finding) => finding.type === "missing_governance_check"), "Expected a missing_governance_check finding.");
  assert(envelope.result.findings.some((finding) => finding.type === "missing_audit"), "Expected a missing_audit finding.");

  console.log("[PASS] agent.failed -> GovernanceSupervisorAgent.supervise() direct dispatch");
}

void run();
