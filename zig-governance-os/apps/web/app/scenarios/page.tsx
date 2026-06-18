import { PageHeader, Section, StatCard } from "@zig/ui";

export default function ScenariosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Scenario Workspace"
        title="Scenario Lab"
        description="Mock workspace for modeling alternate governance plans that will later fork, clone, pause, resume, and feed score changes."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active Runs" value="2" detail="Scenario plans currently being evaluated." />
        <StatCard label="Potential Score Delta" value="+9" detail="Projected improvement from treatment changes." tone="healthy" />
        <StatCard label="Open Decisions" value="4" detail="Choices that need owner review." tone="attention" />
      </div>
      <Section title="Scenario Runs">
        <div className="grid gap-3">
          {["Accelerated ISO evidence push", "Vendor risk treatment alternative"].map((scenario) => (
            <div key={scenario} className="rounded-md border border-[var(--zig-border)] p-4">
              <h2 className="font-display text-lg font-semibold">{scenario}</h2>
              <p className="mt-2 text-sm text-[var(--zig-ink-muted)]">Mock run with generated assets, risks, controls, evidence, and tasks carried forward.</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
