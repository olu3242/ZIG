export interface AgentRaciAssignment {
  agentId: string;
  responsible: string;
  accountable: string;
  consulted: string[];
  informed: string[];
}
export class AgentRaciEngine {
  assign(agentId: string, responsible: string, accountable: string, consulted: string[], informed: string[]): AgentRaciAssignment {
    return { agentId, responsible, accountable, consulted, informed };
  }
}
