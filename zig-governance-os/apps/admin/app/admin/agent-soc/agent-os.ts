import { AgentRuntime, type AgentRunRecord } from "@zig/agent-runtime";
import { AgentGovernanceGuard, type GovernanceDecisionLogEntry } from "@zig/agent-governance";

/**
 * Process-local Agent OS singleton for apps/admin. Both the test-trigger panel
 * (./test-triggers/actions.ts) and the live Agent SOC views (../agent-soc/page.tsx,
 * ./runs/page.tsx) read/write the SAME AgentRuntime + AgentGovernanceGuard instances, so runs
 * fired from the test panel actually show up in the SOC dashboard and run-history view within
 * this process's lifetime.
 *
 * Honest limitation: this is in-memory, per-process state, not a durable store. A fresh
 * `next dev`/`next start` process starts with zero runs. It does NOT aggregate runs from
 * apps/web (a separate Next.js deployment/process) — there is no shared database table for
 * AgentRunRecord/GovernanceDecisionLogEntry in this repo yet. See
 * docs/agents/ZIG_AGENT_LIVE_WIRING.md for the full explanation and what durable persistence
 * would require.
 */
let runtime: AgentRuntime | undefined;
let guard: AgentGovernanceGuard | undefined;

export function getAdminAgentRuntime(): AgentRuntime {
  if (!runtime) {
    runtime = new AgentRuntime();
  }
  return runtime;
}

export function getAdminAgentGovernanceGuard(): AgentGovernanceGuard {
  if (!guard) {
    guard = new AgentGovernanceGuard();
  }
  return guard;
}

/**
 * AgentRuntime does not expose a "list all runs" accessor (only getRun(id) and
 * listAuditTrail()). We derive the run list from the audit trail it already records on every
 * submit()/execute() call (recordAudit() in packages/agent-runtime/src/index.ts), since each
 * RuntimeRecord's payload is a snapshot of the AgentRunRecord at that point in time. We
 * de-duplicate by run id, keeping the latest (most complete) snapshot per run.
 */
export function listAdminAgentRuns(): AgentRunRecord[] {
  const auditTrail = getAdminAgentRuntime().listAuditTrail();
  const byId = new Map<string, AgentRunRecord>();
  for (const record of auditTrail) {
    if (record.entity !== "agent_runs" && record.entity !== "agent_decisions") {
      continue;
    }
    const snapshot = record.payload as unknown as AgentRunRecord;
    byId.set(snapshot.id, reviveRunDates(snapshot));
  }
  return Array.from(byId.values());
}

export function listAdminGovernanceLog(): GovernanceDecisionLogEntry[] {
  return getAdminAgentGovernanceGuard().listLog();
}

function reviveRunDates(run: AgentRunRecord): AgentRunRecord {
  return {
    ...run,
    startedAt: run.startedAt ? new Date(run.startedAt) : undefined,
    completedAt: run.completedAt ? new Date(run.completedAt) : undefined,
  };
}
