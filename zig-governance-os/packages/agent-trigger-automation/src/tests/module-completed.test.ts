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
    domainEventType: "module.completed",
    runtime,
    guard,
    subject: subj,
    context,
    eventId: "evt-module-completed",
  });

  assert(envelope.result.learningPath.run.status === "succeeded", "Expected runLearningPathAgent run to succeed.");
  assert(envelope.result.careerPortfolio.run.status === "succeeded", "Expected runCareerPortfolioAgent run to succeed.");

  console.log("[PASS] module.completed -> runLearningPathAgent() + runCareerPortfolioAgent() dispatch");
}

void run();
