import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertCoachGroundsRepliesInRealRiskAndControlData(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_coach", actorUserId: "user_coach" };

  await services.projects.create(context, {
    id: "project_coach",
    name: "Coach Project",
    frameworkId: "framework_coach",
    status: "active",
  });

  // --- No risks/controls yet: welcome message should be the no-open-risk branch. ---
  const started = await services.coach.startConversation(context, "general");
  if (started.conversation.contextType !== "general" || started.conversation.learnerUserId !== "user_coach") {
    throw new Error("startConversation did not persist the expected conversation.");
  }
  if (!started.welcomeMessage.reasoning || started.welcomeMessage.confidence === undefined) {
    throw new Error("Welcome message did not carry the required explainability fields (reasoning, confidence).");
  }

  const conversations = await services.coach.findConversations(context);
  if (conversations.length !== 1) {
    throw new Error("findConversations did not return the persisted conversation.");
  }

  // --- Add an open (unmitigated) risk: the coach reply should reflect a real count, not a constant. ---
  await repositories.risks.create(context, {
    id: "risk_1",
    projectId: "project_coach",
    assetId: "asset_1",
    title: "Unencrypted backups",
    description: "Backups are not encrypted at rest",
    severity: "high",
    treatment: "avoid",
  });

  const reply = await services.coach.sendMessage(context, started.conversation.id, "What should I prioritize?");
  if (reply.learnerMessage.role !== "learner" || reply.learnerMessage.content !== "What should I prioritize?") {
    throw new Error("sendMessage did not persist the learner's message.");
  }
  const supportingData = reply.coachMessage.supportingData as { openRiskCount: number };
  if (supportingData.openRiskCount !== 1) {
    throw new Error(`Expected the coach reply to report openRiskCount 1 from real risk data, got ${supportingData.openRiskCount}.`);
  }
  if (!reply.coachMessage.frameworkReference) {
    throw new Error("Expected the open-risk coach reply to carry a framework reference.");
  }

  const messages = await services.coach.findMessages(context, started.conversation.id);
  if (messages.length !== 3) {
    throw new Error(`Expected 3 persisted messages (welcome + learner + coach), got ${messages.length}.`);
  }
}

void assertCoachGroundsRepliesInRealRiskAndControlData();
