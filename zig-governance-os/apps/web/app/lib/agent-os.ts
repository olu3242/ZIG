import { AgentRuntime } from "@zig/agent-runtime";
import { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AccessSubject } from "@zig/governance-engine";
import type { RoleName } from "@zig/types";
import {
  emitDomainEvent,
  type DomainEventType,
  type EmitDomainEventInputFor,
} from "@zig/agent-trigger-automation";

/**
 * Process-local Agent OS wiring for apps/web. Mirrors the construction pattern already used by
 * the admin test-trigger panel (apps/admin/app/admin/agent-soc/test-triggers/actions.ts):
 * a single AgentRuntime + AgentGovernanceGuard pair, reused across requests within this
 * process, so AgentRunRecord/GovernanceDecisionLogEntry entries accumulate instead of being
 * thrown away after every dispatch (each `new AgentRuntime()` is an isolated, empty store).
 *
 * Honest limitation: this is in-process memory, not a durable store. It resets on every
 * deploy/restart and is NOT shared with the apps/admin process (a separate Next.js
 * deployment) — see docs/agents/ZIG_AGENT_LIVE_WIRING.md for the full explanation. Real
 * cross-process aggregation would require a durable persistence layer (e.g. the
 * agent_runs/agent_decisions tables referenced in @zig/agent-trigger-automation's header
 * comment) that does not exist yet in this repo.
 */
let sharedRuntime: AgentRuntime | undefined;
let sharedGuard: AgentGovernanceGuard | undefined;

export function getWebAgentRuntime(): AgentRuntime {
  if (!sharedRuntime) {
    sharedRuntime = new AgentRuntime();
  }
  return sharedRuntime;
}

export function getWebAgentGovernanceGuard(): AgentGovernanceGuard {
  if (!sharedGuard) {
    sharedGuard = new AgentGovernanceGuard();
  }
  return sharedGuard;
}

/** Roles that exist in Persona but not RoleName get a safe RBAC-equivalent fallback. */
const PERSONA_TO_ROLE_FALLBACK: Record<string, RoleName> = {
  Executive: "Viewer",
};

function resolveRole(persona: string): RoleName {
  return (PERSONA_TO_ROLE_FALLBACK[persona] as RoleName | undefined) ?? (persona as RoleName);
}

export function webAccessSubject(input: { tenantId: string; userId: string; persona: string }): AccessSubject {
  return {
    user: { id: input.userId, tenantId: input.tenantId, role: resolveRole(input.persona), status: "active" },
    tenantId: input.tenantId,
  };
}

/**
 * Fire-and-forget wrapper around emitDomainEvent() for real production call sites in
 * apps/web. Purely additive: failures are caught and logged, never thrown, so a governance/
 * agent-runtime problem can never block the primary business operation (project creation,
 * onboarding step, etc.) that triggered it.
 */
export async function dispatchDomainEvent<K extends DomainEventType>(
  input: Omit<EmitDomainEventInputFor<K>, "runtime" | "guard">,
): Promise<void> {
  try {
    await emitDomainEvent({
      ...input,
      runtime: getWebAgentRuntime(),
      guard: getWebAgentGovernanceGuard(),
    } as EmitDomainEventInputFor<K>);
  } catch (error) {
    console.error("[AGENT-OS]", `dispatch failed for "${input.domainEventType}"`, error);
  }
}
