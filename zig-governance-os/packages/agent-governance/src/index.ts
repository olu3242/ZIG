import { can, type AccessSubject, type RbacAction, type RbacResource } from "@zig/governance-engine";
import type { AgentContext, AgentDefinition } from "@zig/agents";

/**
 * AgentGovernanceGuard wraps the existing RbacEngine (packages/governance-engine/src/rbac) —
 * it does not replace it. Role/resource/action checks always delegate to can(). This package
 * adds the agent-specific layer RbacEngine has no concept of: agent permission scope, tool
 * access, approval-required actions, and policy violation logging.
 */

export type ApprovalRequiredAction =
  | "evidence_rejection"
  | "readiness_scoring"
  | "report_generation"
  | "policy_finalization"
  | "admin_action"
  | "high_risk_recommendation";

const APPROVAL_REQUIRED_ACTIONS: ReadonlySet<ApprovalRequiredAction> = new Set([
  "evidence_rejection",
  "readiness_scoring",
  "report_generation",
  "policy_finalization",
  "admin_action",
  "high_risk_recommendation",
]);

export interface AgentGovernanceRequest {
  subject: AccessSubject;
  agent: AgentDefinition;
  context: AgentContext;
  resource: RbacResource;
  action: RbacAction;
  tool: string;
  approvalAction?: ApprovalRequiredAction;
}

export interface AgentGovernanceResult {
  allowed: boolean;
  deniedReason?: string;
  requiresApproval: boolean;
  policyViolations: string[];
  escalationTarget?: string;
  auditPayload: Record<string, unknown>;
}

export interface GovernanceDecisionLogEntry {
  outcome: "allowed" | "denied" | "approval_requested" | "policy_violation";
  agentId: string;
  tenantId: string;
  userId: string;
  occurredAt: Date;
  result: AgentGovernanceResult;
}

export class AgentGovernanceGuard {
  private readonly log: GovernanceDecisionLogEntry[] = [];

  evaluate(request: AgentGovernanceRequest): AgentGovernanceResult {
    const policyViolations = this.collectPolicyViolations(request);
    const auditPayload = {
      agentId: request.agent.id,
      tenantId: request.context.tenantId,
      organizationId: request.context.organizationId,
      userId: request.context.userId,
      resource: request.resource,
      action: request.action,
      tool: request.tool,
    };

    if (request.subject.user.tenantId !== request.context.tenantId) {
      return this.recordAndReturn(request, {
        allowed: false,
        deniedReason: "Tenant scope mismatch between the acting subject and the agent's execution context.",
        requiresApproval: false,
        policyViolations,
        auditPayload,
      });
    }

    if (!can(request.subject, request.resource, request.action)) {
      return this.recordAndReturn(request, {
        allowed: false,
        deniedReason: `Role "${request.subject.user.role}" lacks "${request.action}" on "${request.resource}".`,
        requiresApproval: false,
        policyViolations,
        auditPayload,
      });
    }

    const hasToolAccess = request.agent.toolAccess.some((access) => access.tool === request.tool);
    if (!hasToolAccess) {
      return this.recordAndReturn(request, {
        allowed: false,
        deniedReason: `Agent "${request.agent.id}" has no access scope for tool "${request.tool}".`,
        requiresApproval: false,
        policyViolations,
        auditPayload,
      });
    }

    if (policyViolations.length > 0) {
      return this.recordAndReturn(request, {
        allowed: false,
        deniedReason: "Policy violation detected.",
        requiresApproval: false,
        policyViolations,
        escalationTarget: "compliance_supervisor",
        auditPayload,
      });
    }

    const requiresApproval = request.approvalAction !== undefined && APPROVAL_REQUIRED_ACTIONS.has(request.approvalAction);

    return this.recordAndReturn(request, {
      allowed: true,
      requiresApproval,
      policyViolations,
      escalationTarget: requiresApproval ? "human_approver" : undefined,
      auditPayload,
    });
  }

  listLog(): GovernanceDecisionLogEntry[] {
    return [...this.log];
  }

  private collectPolicyViolations(request: AgentGovernanceRequest): string[] {
    const violations: string[] = [];

    if (request.action === "delete" && request.approvalAction === undefined) {
      violations.push(`Destructive action "delete" on "${request.resource}" requires an explicit approval rule.`);
    }

    if (request.approvalAction === "evidence_rejection" && request.resource !== "evidence") {
      violations.push('Approval action "evidence_rejection" must target the "evidence" resource.');
    }

    return violations;
  }

  private recordAndReturn(request: AgentGovernanceRequest, result: AgentGovernanceResult): AgentGovernanceResult {
    const outcome: GovernanceDecisionLogEntry["outcome"] = !result.allowed && result.policyViolations.length > 0
      ? "policy_violation"
      : !result.allowed
        ? "denied"
        : result.requiresApproval
          ? "approval_requested"
          : "allowed";

    this.log.push({
      outcome,
      agentId: request.agent.id,
      tenantId: request.context.tenantId,
      userId: request.context.userId,
      occurredAt: new Date(),
      result,
    });

    return result;
  }
}
