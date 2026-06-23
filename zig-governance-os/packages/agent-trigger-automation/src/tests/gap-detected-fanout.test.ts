import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { emitDomainEvent } from "../index";
import { subject, contextFor, assert } from "./test-helpers";

/**
 * Extra fan-out proof for gap.detected: passes a high-likelihood/high-impact risk so the
 * remediation branch crosses into the high-risk approval path, proving both outcomes are
 * independently produced (policy artifact + remediation) and that the approval flag surfaces
 * correctly on the remediation outcome.
 */
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
    eventId: "evt-gap-detected-fanout",
    payload: {
      risk: { likelihood: 9, impact: 9, controlEffectiveness: 5, treatmentEffectiveness: 5 },
    },
  });

  assert(envelope.result.policyArtifact.run.id !== envelope.result.remediation.run.id, "Expected two distinct runs for the fan-out.");
  assert(envelope.result.remediation.recommendation?.action === "request_high_risk_approval", "Expected high-likelihood/impact risk to trigger the high-risk approval path.");
  assert(envelope.result.remediation.governance.requiresApproval === true, "Expected the remediation governance evaluation to require approval for the high-risk path.");

  console.log("[PASS] gap.detected fan-out -> two independent runs, high-risk approval surfaced");
}

void run();
