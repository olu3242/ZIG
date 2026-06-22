import { agentDefinitions, type AgentDefinition, type AgentKey, type AgentOperationalStatus } from "@zig/agents";

/**
 * @zig/agent-registry is now a compatibility adaptor over the canonical registry in
 * @zig/agents. See docs/agents/ZIG_AGENT_CORE_DECISION.md for why @zig/agents was
 * chosen as canonical and why this package was kept (rather than deleted) as a thin
 * shim: apps/admin/app/admin/agent-control-tower/page.tsx imports `AgentRegistry` and
 * `GovernedAgent` from here, and that import must keep working unmodified.
 *
 * AgentCategory/AgentOperationalStatus/GovernedAgent/AgentRegistry are unchanged in
 * shape. Only the *data* AgentRegistry.inventory() returns has changed: it now derives
 * from the canonical agentDefinitions (all 12 ZIG agents) instead of 3 hand-written
 * example rows, mapped through agentCategoryForKey() below.
 */
export type AgentCategory = "learning" | "compliance" | "risk" | "audit" | "career" | "system";
export type { AgentOperationalStatus };
export interface GovernedAgent {
  id: string;
  name: string;
  type: AgentCategory;
  owner: string;
  department: string;
  supervisor: string;
  permissions: string[];
  tools: string[];
  status: AgentOperationalStatus;
  version: string;
  certificationLevel: number;
}

const categoryByKey: Record<AgentKey, AgentCategory> = {
  compliance: "compliance",
  policy: "compliance",
  evidence: "compliance",
  control: "compliance",
  risk: "risk",
  vendor_risk: "risk",
  audit: "audit",
  assessment: "audit",
  executive: "system",
  automation: "system",
  certification: "career",
  learning: "learning",
};

function toGovernedAgent(definition: AgentDefinition): GovernedAgent {
  return {
    id: definition.id,
    name: definition.name,
    type: categoryByKey[definition.key],
    owner: definition.owner,
    department: definition.department,
    supervisor: definition.supervisor,
    permissions: definition.permissions,
    tools: definition.toolAccess.map((access) => access.tool),
    status: definition.status,
    version: definition.version,
    certificationLevel: definition.certificationLevel,
  };
}

export class AgentRegistry {
  inventory(): GovernedAgent[] {
    return agentDefinitions.map(toGovernedAgent);
  }
}
