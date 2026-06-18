import { triggerRegistry } from "@zig/automation";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function AutomationPage() {
  await requireTenantContext();

  return (
    <>
      <PageHeader
        eyebrow="Automation"
        title="Workflow Command Center"
        description="No-code workflow triggers, conditions, actions, execution history, and observability."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Execution Modes" value="5" detail="Immediate, scheduled, recurring, event-driven, and manual." />
        <StatCard label="Failure Queues" value="Ready" detail="Retry and dead-letter queues are represented in the runtime model." tone="healthy" />
        <StatCard label="Audit Logging" value="Required" detail="Every execution stores tenant, workflow, trigger, user, timestamp, and outcome." />
      </div>
      <Section title="Trigger Registry">
        <DataTable
          columns={["Trigger", "Status"]}
          empty="No triggers registered."
          rows={triggerRegistry.map((trigger) => [trigger, <StatusBadge key={trigger} tone="success">available</StatusBadge>])}
        />
      </Section>
    </>
  );
}
