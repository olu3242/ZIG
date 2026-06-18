export interface AgentHandoffPackage {
  fromAgent: string;
  toAgent: string;
  context: string;
  state: string;
  completedWork: string[];
  evidence: string[];
  confidence: number;
  recommendations: string[];
  nextSteps: string[];
}
export class AgentHandoffEngine {
  create(input: AgentHandoffPackage): AgentHandoffPackage {
    return { ...input, confidence: Math.max(0, Math.min(100, input.confidence)) };
  }
}
