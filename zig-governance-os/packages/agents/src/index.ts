import type { AgentEventType } from "@zig/agent-ingestion";
import type { Persona } from "@zig/types";

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

/**
 * Normalized shared types (Phase 2A). These extend AgentProfile additively —
 * AgentProfile/AgentKey/AgentLifecycleStage/AgentActionPlan are unchanged so the
 * three existing import sites (apps/web/app/agents, apps/web/app/compliance-command-center,
 * apps/admin/app/agents) keep working without modification.
 */

export type AgentId = AgentKey;
export type AgentCapability = string;
export type AgentPermission = string;
export type AgentOperationalStatus = "active" | "degraded" | "suspended" | "certifying";

export interface AgentToolAccess {
  tool: string;
  scope: "read" | "write" | "execute";
}

export interface AgentContext {
  tenantId: string;
  userId: string;
  organizationId?: string;
  persona?: Persona;
}

export interface AgentDecision {
  agentId: AgentId;
  reason: string;
  confidence: number;
  dataUsed: string[];
  sourceReference?: string;
  frameworkReference?: string;
  context: AgentContext;
  action: string;
}

export interface AgentRunInput {
  agentId: AgentId;
  goal: string;
  context: AgentContext;
  stage?: AgentLifecycleStage;
  eventType?: AgentEventType;
}

export interface AgentRunOutput {
  agentId: AgentId;
  decision: AgentDecision;
  stage: AgentLifecycleStage;
  requiresApproval: boolean;
}

export type { AgentEventType } from "@zig/agent-ingestion";

/**
 * AgentDefinition is the canonical, registry-resolvable shape: AgentProfile plus
 * the operational/governance metadata that packages/agent-registry's GovernedAgent
 * previously defined in a second, incompatible shape (owner/department/supervisor/
 * tools/status/version/certificationLevel), plus the confidence threshold and
 * escalation rule the mission's Agent Registry spec requires, plus the event types
 * this agent is a valid runtime subscriber for.
 */
export interface AgentDefinition extends AgentProfile {
  id: AgentId;
  capabilities: AgentCapability[];
  toolAccess: AgentToolAccess[];
  status: AgentOperationalStatus;
  owner: string;
  department: string;
  supervisor: string;
  version: string;
  certificationLevel: number;
  confidenceThreshold: number;
  escalationRule: string;
  eventTypes: AgentEventType[];
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

const departmentByKey: Record<AgentKey, string> = {
  compliance: "GRC",
  risk: "GRC",
  audit: "GRC",
  policy: "GRC",
  vendor_risk: "GRC",
  evidence: "GRC",
  control: "GRC",
  assessment: "GRC",
  executive: "Executive",
  certification: "Academy",
  learning: "Academy",
  automation: "Engineering",
};

/**
 * Generic agent execution-lifecycle events (from @zig/agent-ingestion) this agent
 * is a valid subscriber for. Derived from whether the agent holds an "execute:*"
 * permission — the only existing signal in agentRegistry that actually distinguishes
 * agents that run approved actions (and can therefore be approved/rejected/suspended/
 * recovered) from purely advisory agents (which only start/complete/fail/escalate).
 * This is a deliberately conservative Phase 2A placeholder: domain-specific business
 * triggers (e.g. "evidence.uploaded", "control.failed") are a distinct vocabulary not
 * yet wired to agents — see ZIG_AGENT_CORE_DECISION.md.
 */
function eventTypesFor(profile: AgentProfile): AgentEventType[] {
  const canExecute = profile.permissions.some((permission) => permission.startsWith("execute:"));
  return canExecute
    ? ["agent_started", "agent_completed", "agent_failed", "agent_approved", "agent_rejected", "agent_escalated", "agent_suspended", "agent_recovered"]
    : ["agent_started", "agent_completed", "agent_failed", "agent_escalated"];
}

function toAgentDefinition(profile: AgentProfile): AgentDefinition {
  const canExecute = profile.permissions.some((permission) => permission.startsWith("execute:"));
  return {
    ...profile,
    id: profile.key,
    capabilities: profile.skills,
    toolAccess: [{ tool: `${profile.key}-engine`, scope: canExecute ? "execute" : "read" }],
    status: "active",
    owner: departmentByKey[profile.key],
    department: departmentByKey[profile.key],
    supervisor: `${profile.name.replace(/ Agent$/, "")} Supervisor`,
    version: "1.0.0",
    certificationLevel: 2,
    confidenceThreshold: 0.75,
    escalationRule: canExecute
      ? "Escalate to human approval before executing any action; suspend on repeated failure."
      : "Escalate to human review when confidence falls below threshold.",
    eventTypes: eventTypesFor(profile),
  };
}

const agentDefinitionRegistry = new Map<AgentId, AgentDefinition>(
  agentRegistry.map((profile) => [profile.key, toAgentDefinition(profile)]),
);

/** Canonical, resolvable agent definitions. Source of truth for Phase 2B/3 wiring. */
export const agentDefinitions: AgentDefinition[] = Array.from(agentDefinitionRegistry.values());

/**
 * Registers a new agent definition. Throws if the id is already registered —
 * the registry is the single place duplicate agent ids are rejected, rather than
 * each consumer re-implementing that check.
 */
export function registerAgent(definition: AgentDefinition): void {
  if (agentDefinitionRegistry.has(definition.id)) {
    throw new Error(`Agent "${definition.id}" is already registered.`);
  }
  agentDefinitionRegistry.set(definition.id, definition);
}

export function getAgentById(id: AgentId): AgentDefinition | undefined {
  return agentDefinitionRegistry.get(id);
}

export function getAgentsByCapability(capability: AgentCapability): AgentDefinition[] {
  return Array.from(agentDefinitionRegistry.values()).filter((definition) => definition.capabilities.includes(capability));
}

export function getAgentsByEventType(eventType: AgentEventType): AgentDefinition[] {
  return Array.from(agentDefinitionRegistry.values()).filter((definition) => definition.eventTypes.includes(eventType));
}
