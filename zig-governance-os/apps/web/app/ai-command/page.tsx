import { PageHeader, Section, StatCard } from "@zig/ui";

export default function AiCommandPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Command Center"
        title="AI Governance Coach"
        description="Operator shell for explainable program generation, risk generation, control generation, mappings, gap analysis, readiness, reports, and scenarios."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Generated Records" value="38" detail="Mock records with reason and confidence metadata." tone="healthy" />
        <StatCard label="Confidence Floor" value="82%" detail="Average confidence across current suggestions." />
        <StatCard label="Framework References" value="14" detail="Linked citations across recommendations." />
      </div>
      <Section title="Command Starters">
        <div className="grid gap-3 md:grid-cols-2">
          {["Generate governance program", "Create risk register", "Map controls to ISO 27001", "Run readiness assessment"].map((starter) => (
            <button key={starter} className="rounded-md border border-[var(--zig-border)] px-3 py-3 text-left text-sm font-medium hover:border-[var(--zig-ink)]">
              {starter}
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}
