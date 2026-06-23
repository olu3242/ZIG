import Link from "next/link";
import { AgentAlerting } from "@zig/agent-alerting";
import { AgentChaos } from "@zig/agent-chaos";
import { AgentAuditEngine } from "@zig/agent-audit";
import { AgentRiskManager, type AgentRiskType } from "@zig/agent-risk";
import { AgentSelfHealingEngine, type AgentFailureSignal } from "@zig/agent-self-healing";
import { computeAgentSocHealth } from "@zig/supervisor-agents";
import { requirePlatformOwner } from "../guard";
import { listAdminAgentRuns, listAdminGovernanceLog } from "./agent-os";

const alerts: Array<{ type: AgentRiskType; severity: "critical" | "high" | "medium" | "low"; signal: AgentFailureSignal }> = [
  { type: "prompt_injection", severity: "critical", signal: "policy_violation" },
  { type: "unauthorized_action", severity: "high", signal: "low_confidence" },
  { type: "data_leakage", severity: "critical", signal: "policy_violation" },
  { type: "runaway_execution", severity: "medium", signal: "timeout" },
];

export default async function AgentSocPage() {
  await requirePlatformOwner();
  const runs = listAdminAgentRuns();
  const governanceLog = listAdminGovernanceLog();
  const health = computeAgentSocHealth(runs, governanceLog);
  const risk = new AgentRiskManager();
  const healing = new AgentSelfHealingEngine();
  const alerting = new AgentAlerting();
  const chaos = new AgentChaos();
  const auditEvidence = new AgentAuditEngine().exportEvidence({
    agentId: "system.automation",
    inputHash: "input:sha256",
    outputHash: "output:sha256",
    reasoningSummary: "Policy violation detected and execution suspended.",
    confidence: 88,
    approvals: ["level_3"],
    actions: ["suspend"],
    escalations: ["executive_supervisor"],
    failures: ["policy_violation"],
    recoveries: ["suspend_agent"],
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-zinc-950 px-6 py-10 text-white">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-red-300">Agent SOC</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Agent Security Operations Center</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">Monitor prompt injection, unauthorized access, data leakage, model abuse, credential abuse, and suspicious activity.</p>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Live Fleet Health</h2>
          <Link href="/admin/agent-soc/runs" className="text-xs font-mono uppercase tracking-wide text-teal-300 underline underline-offset-4">
            Per-agent run history &rarr;
          </Link>
        </div>
        <p className="mb-4 max-w-3xl text-sm leading-6 text-zinc-400">
          Computed by <code>computeAgentSocHealth()</code> (<code>@zig/supervisor-agents</code>) over this
          process&apos;s shared, in-memory <code>AgentRuntime</code>/<code>AgentGovernanceGuard</code> instances
          — the same instances the <Link href="/admin/agent-soc/test-triggers" className="underline underline-offset-4">Test Triggers panel</Link> writes
          to. Real, not synthetic — but process-local: a fresh deploy/restart resets it to zero,
          and it does not include runs from the separate apps/web deployment. See{" "}
          <code>docs/agents/ZIG_AGENT_LIVE_WIRING.md</code> for details.
        </p>
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Total Runs" value={health.runCount} />
          <Metric label="Success Rate" value={`${Math.round(health.successRate * 100)}%`} />
          <Metric label="Failure Rate" value={`${Math.round(health.failureRate * 100)}%`} />
          <Metric label="Avg Latency" value={`${health.averageLatencyMs}ms`} />
          <Metric label="Replays" value={health.replayCount} />
          <Metric label="Approvals Required" value={health.approvalCount} />
          <Metric label="Overrides" value={health.overrideCount} />
          <Metric label="Policy Violations" value={health.policyViolationCount} />
        </div>
        <p className="mt-3 font-mono text-xs text-zinc-500">
          Last success: {health.lastSuccessAt ? health.lastSuccessAt.toISOString() : "no successful runs recorded yet in this process"}
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Critical Alerts" value={alerts.filter((alert) => alert.severity === "critical").length} />
        <Metric label="High Alerts" value={alerts.filter((alert) => alert.severity === "high").length} />
        <Metric label="Risk Score" value={risk.score(alerts.map((alert) => ({ type: alert.type, likelihood: alert.severity === "critical" ? 8 : 5, impact: alert.severity === "critical" ? 9 : 7 })))} />
        <Metric label="Audit Evidence" value="Exportable" />
        <Metric label="Alert Channels" value={alerting.route("prompt_injection", "critical").channels.length} />
        <Metric label="Chaos Recovery" value={chaos.simulate("model_outage").recoveryValidated ? "Valid" : "Review"} />
      </section>
      <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-950 font-mono text-xs uppercase text-zinc-500">
            <tr><th className="px-4 py-3">Threat</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Channels</th><th className="px-4 py-3">Remediation</th><th className="px-4 py-3">Mitigation</th></tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={`${alert.type}:${alert.severity}`} className="border-t border-zinc-800">
                <td className="px-4 py-4 font-medium">{alert.type}</td>
                <td className="px-4 py-4 text-zinc-400">{alert.severity}</td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-500">{alerting.route(alert.type === "prompt_injection" ? "prompt_injection" : "suspicious_behavior", alert.severity).channels.join(", ")}</td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-500">{healing.remediate(alert.signal)}</td>
                <td className="px-4 py-4 text-zinc-400">{risk.mitigation(alert.type)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="font-mono text-xs text-zinc-500">Audit evidence: {auditEvidence}</p>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-xl">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 font-mono text-2xl font-semibold">{value}</p>
    </article>
  );
}
