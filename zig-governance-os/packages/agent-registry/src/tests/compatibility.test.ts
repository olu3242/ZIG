import { AgentRegistry } from "../index";

async function assertCompatibilityExportsStillWork(): Promise<void> {
  const inventory = new AgentRegistry().inventory();
  if (inventory.length !== 12) {
    throw new Error(`Expected AgentRegistry.inventory() to derive all 12 canonical @zig/agents definitions, got ${inventory.length}.`);
  }

  const risk = inventory.find((agent) => agent.id === "risk");
  if (!risk || risk.type !== "risk" || !risk.tools.includes("risk-engine")) {
    throw new Error("Expected the risk agent to retain a 'risk' category and a risk-engine tool via the compatibility adaptor.");
  }

  const automation = inventory.find((agent) => agent.id === "automation");
  if (!automation || automation.type !== "system") {
    throw new Error("Expected the automation agent to map to the 'system' category, matching apps/admin's existing AgentControlTower usage.");
  }
}

async function run(): Promise<void> {
  await assertCompatibilityExportsStillWork();
  console.log("[PASS] @zig/agent-registry compatibility tests");
}

void run();
