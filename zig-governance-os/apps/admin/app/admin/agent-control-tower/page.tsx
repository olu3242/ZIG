import { AgentApprovalEngine } from "@zig/agent-approvals";
import { AgentCosting } from "@zig/agent-costing";
import { AgentCertificationFramework } from "@zig/agent-certification";
import { AgentControlTower } from "@zig/agent-control-tower";
import { AgentFinOps } from "@zig/agent-finops";
import { AgentIngestion } from "@zig/agent-ingestion";
import { AgentLedger } from "@zig/agent-ledger";
import { AgentRegistry } from "@zig/agent-registry";
import { AgentReliability } from "@zig/agent-reliability";
import { AgentRiskManager } from "@zig/agent-risk";
import { AgentScorecardEngine } from "@zig/agent-scorecards";
import { AgentSelfHealingEngine } from "@zig/agent-self-healing";
import { AgentTelemetry } from "@zig/agent-telemetry";
import { ModelTelemetry } from "@zig/model-telemetry";
import { SupervisorAgentPlatform } from "@zig/supervisor-agents";
import { requirePlatformOwner } from "../guard";

export default async function AgentControlTowerPage() {
  await requirePlatformOwner();
  const inventory = new AgentRegistry().inventory();
  const riskScore = new AgentRiskManager().score([
    { type: "prompt_injection", likelihood: 5, impact: 7 },
    { type: "data_leakage", likelihood: 3, impact: 9 },
  ]);
  const tower = new AgentControlTower();
  const health = tower.health({
    inventory: inventory.length,
    active: inventory.filter((agent) => agent.status === "active").length,
    degraded: inventory.filter((agent) => agent.status === "degraded").length,
    escalations: 2,
    approvals: 4,
    certificationAverage: 2.4,
    riskScore,
    cost: 128.55,
    utilization: 71,
  });
  const certification = new AgentCertificationFramework().level(["accuracy", "reliability", "security", "auditability"]);
  const scorecard = new AgentScorecardEngine();
  const score = scorecard.score({ accuracy: 84, reliability: 78, successRate: 81, approvalRate: 76, escalationRate: 8, failureRate: 5, recoveryRate: 70, userSatisfaction: 82 });
  const finops = new AgentFinOps();
  const costs = { tokenUsage: 128000, modelCosts: 42.25, executionCosts: 31.4, departmentCosts: 26.1, tenantCosts: 28.8, roi: 1.2 };
  const ingestedEvent = new AgentIngestion().ingest({ tenantId: "tenant", agentId: "system.automation", source: "agent_runtime", type: "agent_recovered", payload: { recovery: "retry" } });
  const ledgerKey = new AgentLedger().evidenceKey({ tenantId: "tenant", agentId: "system.automation", version: 1, inputHash: "input", outputHash: "output", reasoningHash: "reasoning", confidence: 84, approvals: ["level_3"], escalations: [], failures: [], recoveries: ["retry"] });
  const modelTelemetry = new ModelTelemetry();
  const modelRecord = { provider: "openai" as const, modelVersion: "production", promptTokens: 1280, completionTokens: 640, latencyMs: 880, failures: 0, retries: 1, cost: 0.42 };
  const liveCost = new AgentCosting().dailyCost({ costPerAgent: 18.4, costPerWorkflow: 11.2, costPerTenant: 42, costPerStudent: 3.4, costPerAssessment: 1.1, costPerReport: 2.8 });
  const reliability = new AgentReliability().score({ mttrMinutes: 12, mtbfHours: 96, recoveryRate: 88, escalationRate: 8, failureRate: 4, approvalAccuracy: 92, confidenceAccuracy: 84 });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-zinc-950 px-6 py-10 text-white">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-blue-300">Agent Governance OS</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Agent Control Tower</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">Single pane of glass for agent inventory, health, failures, escalations, certifications, approvals, performance, risk, cost, and utilization.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Control Health" value={health} />
        <Metric label="Inventory" value={inventory.length} />
        <Metric label="Risk Score" value={riskScore} />
        <Metric label="Certification" value={`L${certification.level}`} />
        <Metric label="Scorecard" value={scorecard.ranking(score)} />
        <Metric label="Supervisors" value={new SupervisorAgentPlatform().supervisors().length} />
        <Metric label="Telemetry" value={new AgentTelemetry().signals().length} />
        <Metric label="FinOps Cost" value={`$${finops.totalCost(costs)}`} />
        <Metric label="Live Event" value={ingestedEvent.type} />
        <Metric label="Ledger" value="Append" />
        <Metric label="Model Tokens" value={modelTelemetry.totalTokens(modelRecord)} />
        <Metric label="Model Reliability" value={modelTelemetry.reliability(modelRecord)} />
        <Metric label="Daily Cost" value={`$${liveCost}`} />
        <Metric label="Reliability" value={reliability} />
      </section>
      <p className="font-mono text-xs text-zinc-500">Ledger evidence key: {ledgerKey}</p>
      <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-950 font-mono text-xs uppercase text-zinc-500">
            <tr><th className="px-4 py-3">Agent</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Supervisor</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Approval</th><th className="px-4 py-3">Recovery</th></tr>
          </thead>
          <tbody>
            {inventory.map((agent) => (
              <tr key={agent.id} className="border-t border-zinc-800">
                <td className="px-4 py-4 font-medium">{agent.name}</td>
                <td className="px-4 py-4 text-zinc-400">{agent.type}</td>
                <td className="px-4 py-4 text-zinc-400">{agent.supervisor}</td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-500">{agent.status}</td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-500">{new AgentApprovalEngine().request(agent.certificationLevel >= 3 ? 3 : 2).label}</td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-500">{new AgentSelfHealingEngine().remediate(agent.status === "degraded" ? "repeated_error" : "low_confidence")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
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
