import Link from "next/link";
import { PageHeader, Section } from "@zig/ui";
import { frameworks } from "@/app/lib/mock-data";

export default function FrameworksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Framework Registry"
        title="Framework Library"
        description="Supported frameworks are registry metadata used by governance records rather than separate product modules."
      />
      <Section title="Supported Frameworks">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {frameworks.map((framework) => (
            <Link key={framework.id} href="/frameworks/iso27001" className="rounded-md border border-[var(--zig-border)] p-4 hover:border-[var(--zig-ink)]">
              <p className="font-mono text-xs uppercase text-[var(--zig-teal)]">{framework.code}</p>
              <h2 className="mt-2 font-display text-xl font-semibold">{framework.name}</h2>
              <p className="mt-1 font-mono text-xs text-[var(--zig-ink-muted)]">{framework.version}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--zig-ink-muted)]">{framework.description}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
