import { PageHeader, Section, StatCard } from "@zig/ui";

export default function ScenariosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Scenario Workspace"
        title="Scenario Lab"
        description="Workspace for modeling alternate governance plans after the scenario service is connected to project data."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active Runs" value="0" detail="Scenario plans appear after scenario records exist." />
        <StatCard label="Potential Score Delta" value="N/A" detail="Projected improvement requires score history." />
        <StatCard label="Open Decisions" value="0" detail="Decision records appear after workflow integration." />
      </div>
      <Section title="Scenario Runs">
        <p className="text-sm text-[var(--zig-ink-muted)]">No scenario runs exist for this tenant yet.</p>
      </Section>
    </>
  );
}
