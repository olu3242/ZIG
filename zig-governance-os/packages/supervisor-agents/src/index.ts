import type { AgentRunRecord } from "@zig/agent-runtime";
import type { GovernanceDecisionLogEntry } from "@zig/agent-governance";
import type { RuntimeRecord } from "@zig/runtime-persistence";

export type SupervisorAgent = "learning_supervisor" | "compliance_supervisor" | "risk_supervisor" | "audit_supervisor" | "career_supervisor" | "executive_supervisor";
export class SupervisorAgentPlatform {
  supervisors(): SupervisorAgent[] {
    return ["learning_supervisor", "compliance_supervisor", "risk_supervisor", "audit_supervisor", "career_supervisor", "executive_supervisor"];
  }
}

/**
 * Governance Supervisor Agent (Batch 6). A meta-agent: it does not run business
 * recommendations through orchestrateDomainAgent()/agentRegistry — it inspects the records
 * those agents already produce (AgentRunRecord, GovernanceDecisionLogEntry, RuntimeRecord)
 * for governance/safety violations. No registry, runtime, Event Fabric, governance guard, or
 * RbacEngine code is modified or duplicated here.
 */

export type SupervisorSeverity = "critical" | "high" | "medium" | "low" | "info";

export type SupervisorFindingType =
  | "missing_governance_check"
  | "missing_audit"
  | "missing_tenant_context"
  | "missing_rationale"
  | "approval_bypass"
  | "excessive_retries"
  | "duplicate_registration"
  | "unsupported_event_uncovered";

export interface SupervisorFinding {
  type: SupervisorFindingType;
  severity: SupervisorSeverity;
  runId?: string;
  agentId?: string;
  detail: string;
}

export interface SupervisorDecision {
  severity: SupervisorSeverity;
  confidence: number;
  rationale: string;
  escalationRecommended: boolean;
  escalationTarget?: string;
  replayRecommended: boolean;
  rollbackRecommended: boolean;
  policyReferences: string[];
  findings: SupervisorFinding[];
  auditPayload: Record<string, unknown>;
}

/**
 * Action-name substrings that mark a decision as a finalizing/publishing action — the set of
 * outcomes the mission requires an approval gate in front of. Matched against
 * `decision.action` rather than re-deriving each agent's action union, so this stays generic
 * across every domain/execution agent without importing their per-agent types.
 */
const FINALIZING_ACTION_PATTERNS = ["publication_approval", "publish", "report_generation", "policy_finalization", "rejection_approval", "high_risk_approval"];

function isFinalizingAction(action: string | undefined): boolean {
  if (!action) return false;
  return FINALIZING_ACTION_PATTERNS.some((pattern) => action.includes(pattern));
}

const MAX_HEALTHY_ATTEMPTS = 3;

export class GovernanceSupervisorAgent {
  /** Detects runs that completed (succeeded or failed) with zero corresponding governance log entries for their tenant. */
  detectMissingGovernanceCheck(runs: AgentRunRecord[], governanceLog: GovernanceDecisionLogEntry[]): SupervisorFinding[] {
    return runs
      .filter((run) => run.status === "succeeded" || run.status === "failed" || run.status === "dead_letter")
      .filter((run) => !governanceLog.some((entry) => entry.agentId === run.agentId && entry.tenantId === run.tenantId))
      .map((run) => ({
        type: "missing_governance_check" as const,
        severity: "critical" as const,
        runId: run.id,
        agentId: run.agentId,
        detail: `Run "${run.id}" for agent "${run.agentId}" completed with no matching governance log entry — execution may have bypassed AgentGovernanceGuard.`,
      }));
  }

  /** Detects runs absent from the runtime's audit trail entirely. */
  detectMissingAudit(runs: AgentRunRecord[], auditTrail: RuntimeRecord[]): SupervisorFinding[] {
    return runs
      .filter((run) => !auditTrail.some((record) => record.entityId === run.id))
      .map((run) => ({
        type: "missing_audit" as const,
        severity: "critical" as const,
        runId: run.id,
        agentId: run.agentId,
        detail: `Run "${run.id}" has no audit trail record — runtime persistence was skipped.`,
      }));
  }

  /** Detects runs missing tenant or user context. */
  detectMissingTenantContext(runs: AgentRunRecord[]): SupervisorFinding[] {
    return runs
      .filter((run) => !run.tenantId || !run.userId)
      .map((run) => ({
        type: "missing_tenant_context" as const,
        severity: "critical" as const,
        runId: run.id,
        agentId: run.agentId,
        detail: `Run "${run.id}" is missing tenant or user context (tenantId="${run.tenantId}", userId="${run.userId}").`,
      }));
  }

  /** Detects succeeded runs whose decision carries no rationale ("reason"). */
  detectMissingRationale(runs: AgentRunRecord[]): SupervisorFinding[] {
    return runs
      .filter((run) => run.status === "succeeded" && !run.decision?.reason?.trim())
      .map((run) => ({
        type: "missing_rationale" as const,
        severity: "high" as const,
        runId: run.id,
        agentId: run.agentId,
        detail: `Run "${run.id}" succeeded with no decision rationale — violates the explainability requirement.`,
      }));
  }

  /**
   * Detects a finalizing/publishing decision (per FINALIZING_ACTION_PATTERNS — readiness
   * publication, official reports, policy finalization, evidence rejection, high-risk
   * remediation) whose governance log entry did not actually require approval. Covers:
   * approval bypass, rejected evidence without approval, readiness publication without
   * approval, official report without approval, and policy finalization without approval —
   * all the same shape of violation (a risky action class missing its approval gate).
   */
  detectApprovalBypass(runs: AgentRunRecord[], governanceLog: GovernanceDecisionLogEntry[]): SupervisorFinding[] {
    return runs
      .filter((run) => run.status === "succeeded" && isFinalizingAction(run.decision?.action))
      .filter((run) => {
        const entry = governanceLog.find((log) => log.agentId === run.agentId && log.tenantId === run.tenantId);
        return !entry?.result.requiresApproval;
      })
      .map((run) => ({
        type: "approval_bypass" as const,
        severity: "critical" as const,
        runId: run.id,
        agentId: run.agentId,
        detail: `Run "${run.id}" produced finalizing action "${run.decision?.action}" without a governance entry requiring approval.`,
      }));
  }

  /** Detects runs that have exhausted (or are close to exhausting) retry attempts. */
  detectExcessiveRetries(runs: AgentRunRecord[], maxAttempts = MAX_HEALTHY_ATTEMPTS): SupervisorFinding[] {
    return runs
      .filter((run) => run.status === "dead_letter" || run.attempts >= maxAttempts)
      .map((run) => ({
        type: "excessive_retries" as const,
        severity: run.status === "dead_letter" ? "high" as const : "medium" as const,
        runId: run.id,
        agentId: run.agentId,
        detail: `Run "${run.id}" has reached ${run.attempts} attempt(s) (status: ${run.status}).`,
      }));
  }

  /** Detects duplicate ids in a list of agent/registration identifiers. */
  detectDuplicateRegistration(ids: string[]): SupervisorFinding[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) duplicates.add(id);
      seen.add(id);
    }
    return Array.from(duplicates).map((id) => ({
      type: "duplicate_registration" as const,
      severity: "critical" as const,
      agentId: id,
      detail: `Agent id "${id}" is registered more than once.`,
    }));
  }

  /** Detects event types with zero subscribing agents — would be silently ignored if a caller swallows UnsupportedAgentEventError instead of letting it fail loudly. */
  detectUnsupportedEventCoverage(eventTypes: string[], agentEventTypesByAgent: string[][]): SupervisorFinding[] {
    const covered = new Set(agentEventTypesByAgent.flat());
    return eventTypes
      .filter((type) => !covered.has(type))
      .map((type) => ({
        type: "unsupported_event_uncovered" as const,
        severity: "medium" as const,
        detail: `Event type "${type}" has no subscribing agent — a caller that swallows UnsupportedAgentEventError would silently drop it.`,
      }));
  }

  /** Runs every detector and produces a single supervisor decision summarizing fleet health. */
  supervise(input: {
    runs: AgentRunRecord[];
    governanceLog: GovernanceDecisionLogEntry[];
    auditTrail: RuntimeRecord[];
    registeredAgentIds?: string[];
  }): SupervisorDecision {
    const findings: SupervisorFinding[] = [
      ...this.detectMissingGovernanceCheck(input.runs, input.governanceLog),
      ...this.detectMissingAudit(input.runs, input.auditTrail),
      ...this.detectMissingTenantContext(input.runs),
      ...this.detectMissingRationale(input.runs),
      ...this.detectApprovalBypass(input.runs, input.governanceLog),
      ...this.detectExcessiveRetries(input.runs),
      ...this.detectDuplicateRegistration(input.registeredAgentIds ?? []),
    ];

    const severity = highestSeverity(findings);
    const escalationRecommended = severity === "critical" || severity === "high";
    const replayRecommended = findings.some((finding) => finding.type === "excessive_retries");
    const rollbackRecommended = findings.some((finding) => finding.type === "approval_bypass" || finding.type === "missing_governance_check");

    return {
      severity,
      confidence: findings.length === 0 ? 0.95 : Math.max(0.5, 0.95 - findings.length * 0.05),
      rationale: findings.length === 0
        ? "No governance, audit, or approval violations detected across the supervised run set."
        : `Detected ${findings.length} finding(s): ${findings.map((finding) => finding.type).join(", ")}.`,
      escalationRecommended,
      escalationTarget: escalationRecommended ? "compliance_supervisor" : undefined,
      replayRecommended,
      rollbackRecommended,
      policyReferences: Array.from(new Set(findings.map((finding) => finding.type))),
      findings,
      auditPayload: { runCount: input.runs.length, governanceLogCount: input.governanceLog.length, findingCount: findings.length },
    };
  }
}

function highestSeverity(findings: SupervisorFinding[]): SupervisorSeverity {
  const order: SupervisorSeverity[] = ["critical", "high", "medium", "low", "info"];
  for (const level of order) {
    if (findings.some((finding) => finding.severity === level)) return level;
  }
  return "info";
}

/**
 * Agent SOC health/telemetry aggregation (Batch 6). Reuses the same AgentRunRecord/
 * GovernanceDecisionLogEntry shapes the runtime/governance guard already produce — no new
 * tables, no new persistence layer.
 */
export interface AgentSocHealthSnapshot {
  runCount: number;
  successRate: number;
  failureRate: number;
  averageLatencyMs: number;
  replayCount: number;
  approvalCount: number;
  overrideCount: number;
  policyViolationCount: number;
  lastSuccessAt?: Date;
}

export function computeAgentSocHealth(runs: AgentRunRecord[], governanceLog: GovernanceDecisionLogEntry[]): AgentSocHealthSnapshot {
  const runCount = runs.length;
  const succeeded = runs.filter((run) => run.status === "succeeded");
  const failed = runs.filter((run) => run.status === "failed" || run.status === "dead_letter");
  const latencies = succeeded
    .filter((run) => run.startedAt && run.completedAt)
    .map((run) => run.completedAt!.getTime() - run.startedAt!.getTime());

  const replayCount = runs.filter((run) => run.attempts > 0).length;
  const approvalCount = governanceLog.filter((entry) => entry.result.requiresApproval).length;
  const overrideCount = governanceLog.filter((entry) => entry.result.policyViolations.length > 0 && entry.result.allowed).length;
  const policyViolationCount = governanceLog.filter((entry) => entry.result.policyViolations.length > 0).length;

  const lastSuccess = succeeded
    .filter((run) => run.completedAt)
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())[0];

  return {
    runCount,
    successRate: runCount === 0 ? 0 : Math.round((succeeded.length / runCount) * 100) / 100,
    failureRate: runCount === 0 ? 0 : Math.round((failed.length / runCount) * 100) / 100,
    averageLatencyMs: latencies.length === 0 ? 0 : Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length),
    replayCount,
    approvalCount,
    overrideCount,
    policyViolationCount,
    lastSuccessAt: lastSuccess?.completedAt,
  };
}
