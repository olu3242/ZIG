export type AgentCategory = "learning" | "compliance" | "risk" | "audit" | "career" | "system";
export type AgentOperationalStatus = "active" | "degraded" | "suspended" | "certifying";
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
export class AgentRegistry {
  inventory(): GovernedAgent[] {
    return [
      { id: "learning.tutor", name: "Tutor Agent", type: "learning", owner: "Learning", department: "Academy", supervisor: "Learning Supervisor", permissions: ["teach:concepts"], tools: ["content"], status: "active", version: "1.0.0", certificationLevel: 3 },
      { id: "grc.risk", name: "Risk Agent", type: "risk", owner: "Risk", department: "GRC", supervisor: "Risk Supervisor", permissions: ["read:risks", "recommend:treatments"], tools: ["risk-engine"], status: "certifying", version: "1.0.0", certificationLevel: 2 },
      { id: "system.automation", name: "Automation Agent", type: "system", owner: "Platform", department: "Engineering", supervisor: "Executive Supervisor", permissions: ["execute:approved_workflows"], tools: ["runtime-queue"], status: "degraded", version: "0.9.0", certificationLevel: 2 },
    ];
  }
}
