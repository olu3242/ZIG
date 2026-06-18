import { FrameworkRegistry } from "@zig/framework-engine";
import { PageHeader, Section, StatCard } from "@zig/ui";

export default function FrameworkDetailPage() {
  const framework = FrameworkRegistry.get("ISO27001");

  return (
    <>
      <PageHeader eyebrow={framework.code} title={framework.name} description={framework.description} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Version" value={framework.version} detail="Registry metadata version." />
        <StatCard label="Mapped Controls" value="28" detail="Mock controls linked to the active project." tone="healthy" />
        <StatCard label="Coverage" value="68%" detail="Implementation coverage before evidence review." tone="attention" />
      </div>
      <Section title="Readiness Snapshot">
        <p className="text-sm leading-6 text-[var(--zig-ink-muted)]">
          Detail pages will expand into coverage, mappings, and readiness calculations in the framework intelligence batch.
        </p>
      </Section>
    </>
  );
}
