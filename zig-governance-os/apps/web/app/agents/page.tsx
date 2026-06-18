import { AgentOperatingSystem } from "@zig/agents";
import { AgentWorkforceManager } from "@zig/agent-workforce";
import { AiGovernanceLayer } from "@zig/ai-governance";
import { PageHeader, Section, StatCard, StatusBadge, DataTable } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function AgentsPage() {
  await requireTenantContext();
  const agentOs = new AgentOperatingSystem();
  const workforce = new AgentWorkforceManager();
  const governance = new AiGovernanceLayer();
  const agents = agentOs.listAgents();
  const actionPlan = agentOs.plan("compliance", "Review ISO 27001 readiness drift", "recommend");
  const assignment = workforce.assign("compliance", "tenant-admin");
  const executionAllowed = governance.canExecute({
    agentPermissions: ["read:frameworks", "recommend:controls"],
    approvalRequired: false,
    piiProtection: true,
    auditLogging: true,
    promptGovernance: true,
    modelGovernance: true,
  });

  return (
    <>
      <PageHeader
        eyebrow="Agent OS"
        title="Autonomous Agent Registry"
        description="Governed compliance, risk, audit, policy, evidence, control, assessment, executive, certification, learning, and automation agents with human approval boundaries."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Agents Registered" value={agents.length} detail="Autonomous workforce profiles." tone="healthy" />
        <StatCard label="Lifecycle Stages" value={7} detail="Observe, analyze, recommend, execute, validate, learn, report." />
        <StatCard label="Approval Required" value={assignment.approvalRequired ? "Yes" : "No"} detail="Human-in-the-loop default." tone="attention" />
        <StatCard label="Governed Execute" value={executionAllowed ? "Allowed" : "Review"} detail="PII, audit, prompt, and model controls evaluated." />
      </div>

      <Section title="Agent Action Plan">
        <div className="grid gap-3 text-sm text-[var(--zig-ink-muted)] md:grid-cols-4">
          <p><span className="font-mono text-[var(--zig-teal)]">Agent</span><br />{actionPlan.agentKey}</p>
          <p><span className="font-mono text-[var(--zig-teal)]">Stage</span><br />{actionPlan.stage}</p>
          <p><span className="font-mono text-[var(--zig-teal)]">Audit Label</span><br />{actionPlan.auditLabel}</p>
          <p><span className="font-mono text-[var(--zig-teal)]">Approval</span><br />{actionPlan.requiresApproval ? "Required" : "Not required"}</p>
        </div>
      </Section>

      <Section title="Registry">
        <DataTable
          columns={["Agent", "Mission", "Skills", "Permissions", "Lifecycle"]}
          empty="No agents registered."
          rows={agents.map((agent) => [
            <span key="name" className="font-medium">{agent.name}</span>,
            agent.mission,
            agent.skills.join(", "),
            agent.permissions.join(", "),
            <StatusBadge key="lifecycle" tone="success">{agent.lifecycle.length} stages</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
