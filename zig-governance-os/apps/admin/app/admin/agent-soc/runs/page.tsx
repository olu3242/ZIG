import Link from "next/link";
import type { AgentRunRecord } from "@zig/agent-runtime";
import type { GovernanceDecisionLogEntry } from "@zig/agent-governance";
import { requirePlatformOwner } from "../../guard";
import { listAdminAgentRuns, listAdminGovernanceLog } from "../agent-os";

/**
 * Per-agent run-history view (Task 3). Sourced from the SAME process-local AgentRuntime/
 * AgentGovernanceGuard singletons as /admin/agent-soc (../agent-os.ts) and the Test Triggers
 * panel (../test-triggers/actions.ts) — fire a trigger there, see it show up here.
 *
 * Covers all 11 agents: the 10 registry-resolved business agents (AgentId, see
 * @zig/agents AgentKey) plus the Governance Supervisor meta-agent, which is not
 * registry-resolved and does not submit a run (see docs/agents/ZIG_AGENT_TRIGGER_MAP.md,
 * "agent.failed — the documented exception") — its row is always "no runs" by design, since
 * it inspects records rather than producing AgentRunRecords of its own.
 */

const AGENT_LABELS: Record<string, string> = {
  evidence: "Evidence Review",
  compliance: "Framework Mapping",
  risk: "Risk Assessment",
  control: "Control Advisor",
  policy: "Policy Artifact",
  audit: "Remediation",
  assessment: "Readiness Scoring",
  executive: "Reporting",
  learning: "Learning Path",
  certification: "Career Portfolio",
  vendor_risk: "Vendor Risk",
  automation: "Automation",
};

const GOVERNANCE_SUPERVISOR_ROW = "governance_supervisor";

export default async function AgentSocRunsPage() {
  await requirePlatformOwner();
  const runs = listAdminAgentRuns();
  const governanceLog = listAdminGovernanceLog();

  const agentIds = Array.from(new Set([...Object.keys(AGENT_LABELS), ...runs.map((run) => run.agentId)]));
  const runsByAgent = new Map<string, AgentRunRecord[]>();
  for (const agentId of agentIds) {
    runsByAgent.set(
      agentId,
      runs
        .filter((run) => run.agentId === agentId)
        .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))
        .slice(0, 10),
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-zinc-950 px-6 py-10 text-white">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-red-300">Agent SOC / Run History</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Per-Agent Run History</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
          Recent <code>AgentRunRecord</code>s per agent (most recent 10), sourced from this process&apos;s
          shared <code>AgentRuntime</code> audit trail. Fire events from the{" "}
          <Link href="/admin/agent-soc/test-triggers" className="underline underline-offset-4">Test Triggers panel</Link>
          {" "}or via real production call sites (see <code>docs/agents/ZIG_AGENT_LIVE_WIRING.md</code>) to populate
          this view. Process-local only — resets on restart, not shared with apps/web.
        </p>
        <Link href="/admin/agent-soc" className="mt-3 inline-block text-xs font-mono uppercase tracking-wide text-teal-300 underline underline-offset-4">
          &larr; Back to Agent SOC
        </Link>
      </section>

      {agentIds.map((agentId) => (
        <AgentRunTable
          key={agentId}
          agentId={agentId}
          label={AGENT_LABELS[agentId] ?? agentId}
          runs={runsByAgent.get(agentId) ?? []}
          governanceLog={governanceLog}
        />
      ))}

      <AgentRunTable
        agentId={GOVERNANCE_SUPERVISOR_ROW}
        label="Governance Supervisor (meta-agent)"
        runs={[]}
        governanceLog={governanceLog}
        note="Not registry-resolved and does not submit a run — it inspects already-collected AgentRunRecord/GovernanceDecisionLogEntry/RuntimeRecord slices directly (GovernanceSupervisorAgent.supervise()). This row is always empty by design; see the 'agent.failed' panel result on the Test Triggers page for its decision output instead."
      />
    </main>
  );
}

function AgentRunTable({
  label,
  runs,
  governanceLog,
  note,
}: {
  agentId: string;
  label: string;
  runs: AgentRunRecord[];
  governanceLog: GovernanceDecisionLogEntry[];
  note?: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <h2 className="font-mono text-sm uppercase tracking-wide text-zinc-200">{label}</h2>
        {note ? <p className="mt-1 text-xs text-zinc-500">{note}</p> : null}
      </div>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-zinc-950 font-mono text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-2">Run</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Started</th>
            <th className="px-4 py-2">Completed</th>
            <th className="px-4 py-2">Decision</th>
            <th className="px-4 py-2">Governance</th>
          </tr>
        </thead>
        <tbody>
          {runs.length === 0 ? (
            <tr className="border-t border-zinc-800">
              <td className="px-4 py-4 text-zinc-600" colSpan={6}>
                No runs recorded yet in this process. Fire a trigger from the Test Triggers panel, or wait for a
                real production dispatch (see docs/agents/ZIG_AGENT_LIVE_WIRING.md).
              </td>
            </tr>
          ) : (
            runs.map((run) => {
              const govEntry = governanceLog.find((entry) => entry.agentId === run.agentId && entry.tenantId === run.tenantId);
              return (
                <tr key={run.id} className="border-t border-zinc-800 align-top">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{run.id}</td>
                  <td className="px-4 py-3">
                    <span className={statusTone(run.status)}>{run.status}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{run.startedAt ? run.startedAt.toISOString() : "n/a"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{run.completedAt ? run.completedAt.toISOString() : "n/a"}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {run.decision ? `${run.decision.action} (confidence ${run.decision.confidence ?? "n/a"})` : run.errorMessage ?? "n/a"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {govEntry ? `allowed=${govEntry.result.allowed}; approval=${govEntry.result.requiresApproval}; violations=${govEntry.result.policyViolations.length}` : "no governance entry"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </section>
  );
}

function statusTone(status: AgentRunRecord["status"]): string {
  if (status === "succeeded") return "text-emerald-400";
  if (status === "failed" || status === "dead_letter") return "text-red-400";
  return "text-amber-400";
}
