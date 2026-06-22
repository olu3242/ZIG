import { getAgentById, getAgentsByCapability, getAgentsByEventType, registerAgent, agentDefinitions, type AgentDefinition } from "../index";

async function assertRegistryLoadsCanonicalAgents(): Promise<void> {
  if (agentDefinitions.length !== 12) {
    throw new Error(`Expected 12 canonical agent definitions, got ${agentDefinitions.length}.`);
  }

  const ids = new Set(agentDefinitions.map((definition) => definition.id));
  if (ids.size !== 12) {
    throw new Error("Canonical agent definitions contain duplicate ids.");
  }
}

async function assertDuplicateAgentIdsAreRejected(): Promise<void> {
  const duplicate: AgentDefinition = {
    ...agentDefinitions[0],
  };

  let threw = false;
  try {
    registerAgent(duplicate);
  } catch {
    threw = true;
  }

  if (!threw) {
    throw new Error("registerAgent() did not reject a duplicate agent id.");
  }
}

async function assertAgentResolvesByCapability(): Promise<void> {
  const matches = getAgentsByCapability("framework_mapping");
  if (matches.length !== 1 || matches[0].id !== "compliance") {
    throw new Error("Expected exactly the compliance agent to resolve for capability 'framework_mapping'.");
  }

  const none = getAgentsByCapability("capability_that_does_not_exist");
  if (none.length !== 0) {
    throw new Error("Expected no agents to resolve for a nonexistent capability.");
  }
}

async function assertAgentResolvesByEventType(): Promise<void> {
  const everyAgentStarts = getAgentsByEventType("agent_started");
  if (everyAgentStarts.length !== 12) {
    throw new Error("Expected all 12 agents to be valid subscribers of 'agent_started'.");
  }

  const onlyExecutingAgentsApprove = getAgentsByEventType("agent_approved");
  if (onlyExecutingAgentsApprove.length !== 1 || onlyExecutingAgentsApprove[0].id !== "automation") {
    throw new Error("Expected only the automation agent (the sole execute:* permission holder) to subscribe to 'agent_approved'.");
  }

  const byId = getAgentById("automation");
  if (!byId || byId.escalationRule.toLowerCase().indexOf("approval") === -1) {
    throw new Error("Expected the automation agent's escalation rule to require human approval before execution.");
  }
}

async function run(): Promise<void> {
  await assertRegistryLoadsCanonicalAgents();
  await assertDuplicateAgentIdsAreRejected();
  await assertAgentResolvesByCapability();
  await assertAgentResolvesByEventType();
  console.log("[PASS] @zig/agents registry tests");
}

void run();
