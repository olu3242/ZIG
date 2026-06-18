import { PageHeader, Section } from "@zig/ui";
import { frameworks } from "@/app/lib/mock-data";

export default function CreateProjectPage() {
  return (
    <>
      <PageHeader
        eyebrow="Project Builder"
        title="Create Project"
        description="Mock workflow for selecting an industry, choosing a framework, and generating a starter governance project."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Section title="1. Select Industry">
          <div className="grid gap-2 text-sm">
            {["SaaS", "Fintech", "Healthcare"].map((industry) => (
              <div key={industry} className="rounded-md border border-[var(--zig-border)] px-3 py-2">{industry}</div>
            ))}
          </div>
        </Section>
        <Section title="2. Select Framework">
          <div className="grid gap-2 text-sm">
            {frameworks.slice(0, 3).map((framework) => (
              <div key={framework.id} className="rounded-md border border-[var(--zig-border)] px-3 py-2">{framework.name}</div>
            ))}
          </div>
        </Section>
        <Section title="3. Generate Project">
          <p className="text-sm leading-6 text-[var(--zig-ink-muted)]">
            The next batch will turn this mock action into project, asset, risk, control, evidence, and task generation.
          </p>
          <button className="mt-4 rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">
            Generate Project
          </button>
        </Section>
      </div>
    </>
  );
}
