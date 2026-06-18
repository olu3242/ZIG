export type AgentKey =
  | "compliance"
  | "risk"
  | "audit"
  | "policy"
  | "vendor_risk"
  | "evidence"
  | "control"
  | "assessment"
  | "executive"
  | "certification"
  | "learning"
  | "automation";

export type AgentLifecycleStage = "observe" | "analyze" | "recommend" | "execute" | "validate" | "learn" | "report";

export interface AgentProfile {
  key: AgentKey;
  name: string;
  mission: string;
  skills: string[];
  permissions: string[];
  lifecycle: AgentLifecycleStage[];
}

export interface AgentActionPlan {
  agentKey: AgentKey;
  goal: string;
  stage: AgentLifecycleStage;
  requiresApproval: boolean;
  auditLabel: string;
}

export const agentRegistry: AgentProfile[] = [
  agent("compliance", "Compliance Agent", "Continuously evaluate framework posture.", ["framework_mapping", "gap_analysis"], ["read:frameworks", "recommend:controls"]),
  agent("risk", "Risk Agent", "Discover and prioritize operational risk.", ["risk_forecasting", "treatment_recommendations"], ["read:risks", "recommend:treatments"]),
  agent("audit", "Audit Agent", "Prepare audits and monitor findings.", ["audit_readiness", "finding_analysis"], ["read:audits", "recommend:remediation"]),
  agent("policy", "Policy Agent", "Review and draft policy improvements.", ["policy_drafting", "attestation_review"], ["read:policies", "recommend:policy"]),
  agent("vendor_risk", "Vendor Risk Agent", "Monitor third-party risk signals.", ["vendor_scoring", "renewal_recommendations"], ["read:vendors", "recommend:vendor_actions"]),
  agent("evidence", "Evidence Agent", "Collect, classify, and maintain evidence.", ["evidence_collection", "evidence_classification"], ["read:evidence", "recommend:evidence"]),
  agent("control", "Control Agent", "Monitor control health and test readiness.", ["control_testing", "control_recommendations"], ["read:controls", "recommend:tests"]),
  agent("assessment", "Assessment Agent", "Run readiness assessments.", ["readiness_scoring", "assessment_reporting"], ["read:assessments", "recommend:gaps"]),
  agent("executive", "Executive Agent", "Summarize posture for leadership.", ["executive_briefings", "board_reporting"], ["read:metrics", "generate:briefings"]),
  agent("certification", "Certification Agent", "Forecast certification readiness.", ["certification_forecast", "readiness_review"], ["read:certifications", "recommend:remediation"]),
  agent("learning", "Learning Agent", "Recommend learning and practice paths.", ["study_plans", "skill_gap_analysis"], ["read:learning", "recommend:academy"]),
  agent("automation", "Automation Agent", "Orchestrate approved GRC workflows.", ["workflow_execution", "approval_routing"], ["read:workflows", "execute:approved_workflows"]),
];

export class AgentOperatingSystem {
  listAgents(): AgentProfile[] {
    return agentRegistry;
  }

  plan(agentKey: AgentKey, goal: string, stage: AgentLifecycleStage = "recommend"): AgentActionPlan {
    if (!goal.trim()) {
      throw new Error("Agent goal is required.");
    }

    return {
      agentKey,
      goal,
      stage,
      requiresApproval: stage === "execute",
      auditLabel: `agent.${agentKey}.${stage}`,
    };
  }
}

function agent(key: AgentKey, name: string, mission: string, skills: string[], permissions: string[]): AgentProfile {
  return { key, name, mission, skills, permissions, lifecycle: ["observe", "analyze", "recommend", "execute", "validate", "learn", "report"] };
}
