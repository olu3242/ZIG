import { AgentGovernanceGuard } from "@zig/agent-governance";
import { AgentRuntime } from "@zig/agent-runtime";
import { emitDomainEvent } from "../index";
import { subject, contextFor, assert } from "./test-helpers";

/**
 * Extra fan-out proof for module.completed: confirms the two outcomes are independently
 * produced runs sharing the same learnerId but each with their own run id, decision, and
 * audit trail entry — and that a requestPublish payload correctly routes the career
 * portfolio branch into its approval-required path.
 */
async function run(): Promise<void> {
  const runtime = new AgentRuntime();
  const guard = new AgentGovernanceGuard();
  const subj = subject();
  const context = contextFor(subj);

  const envelope = await emitDomainEvent({
    domainEventType: "module.completed",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-module-completed-fanout",
    payload: {
      requestPublish: true,
      portfolioScore: 90,
      certificationReadiness: 90,
      interviewReadiness: 90,
      practicalExperience: 90,
    },
  });

  assert(envelope.result.learningPath.run.id !== envelope.result.careerPortfolio.run.id, "Expected two distinct runs for the fan-out.");
  assert(envelope.result.careerPortfolio.recommendation?.action === "request_portfolio_publish_approval", "Expected a high readiness + requestPublish payload to route to the publish-approval action.");
  assert(envelope.result.careerPortfolio.governance.requiresApproval === true, "Expected the career portfolio governance evaluation to require approval.");
  assert(runtime.listAuditTrail().length >= 2, "Expected at least two audit entries (one per fanned-out agent).");

  console.log("[PASS] module.completed fan-out -> two independent runs, publish approval surfaced");
}

void run();
