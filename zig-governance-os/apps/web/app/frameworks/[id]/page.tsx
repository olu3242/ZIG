import { notFound } from "next/navigation";
import { PageHeader, Section, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";

export default async function FrameworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context } = await requireTenantContext();
  const framework = await getZigServices().frameworks.findById(context, id);

  if (!framework) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow={framework.code}
        title={framework.name}
        description={framework.description}
        actions={<StatusBadge tone="success">{framework.status ?? "active"}</StatusBadge>}
      />
      <Section title="Framework Metadata">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div><dt className="font-medium">Version</dt><dd className="text-[var(--zig-ink-muted)]">{framework.version}</dd></div>
          <div><dt className="font-medium">Framework ID</dt><dd className="font-mono text-[var(--zig-ink-muted)]">{framework.id}</dd></div>
        </dl>
      </Section>
    </>
  );
}
