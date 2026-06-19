import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { aiCoaches, assessments, certifications, labs, learningPaths } from "@/app/lib/mvp-data";

export default async function CoachPage() {
  await requireTenantContext();

  return (
    <>
      <PageHeader eyebrow="AI Coach" title="ZIG Coach Center" description="Context-aware coaching for learning, labs, risks, compliance, audit readiness, and career progression." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Coaches" value={aiCoaches.length} detail="MVP role-specific coaches." tone="healthy" />
        <StatCard label="Conversation Store" value="Ready" detail="ai_conversations and ai_messages schema." />
        <StatCard label="Context" value="Tenant + Task" detail="Current module, role, tenant, and task context." />
      </div>
      <Section title="Available Coaches">
        <DataTable
          columns={["Coach", "Focus", "Status"]}
          empty="No coaches configured."
          rows={aiCoaches.map((coach) => [
            coach.name,
            coach.focus,
            <StatusBadge key={coach.id} tone="success">ready</StatusBadge>,
          ])}
        />
      </Section>
      <Section title="Context-Aware Recommendations">
        <DataTable
          columns={["Coach", "Context", "Recommendation"]}
          empty="No recommendations."
          rows={[
            ["Audit Coach", `${labs.length} labs, ${assessments.length} assessments`, "Strengthen evidence traceability before attempting an audit report export."],
            ["Career Coach", `${certifications.length} certifications, ${learningPaths.filter((path) => path.progress >= 40).length} active paths`, "Prioritize ISO Foundations, Risk Register Builder, and portfolio packaging."],
            ["Risk Coach", "Risk register + heatmap", "Treat critical identity and vendor risks before executive reporting."],
            ["Portfolio Reviewer", "Generated artifacts", "Package risk register, vendor review, and audit report into a single proof-of-experience bundle."],
          ]}
        />
      </Section>
      <Section title="Prompt Starter">
        <div className="rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] p-4 text-sm leading-6 text-[var(--zig-ink-muted)]">
          Ask: “Review my current lab artifact and tell me the next best action to improve audit readiness.”
        </div>
      </Section>
    </>
  );
}
