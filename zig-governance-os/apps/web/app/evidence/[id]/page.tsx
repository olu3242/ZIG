import Link from "next/link";
import { PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { evidenceTemplates } from "@/app/lib/mvp-data";

export default async function EvidenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTenantContext();
  const { id } = await params;
  const evidence = evidenceTemplates.find((item) => item.id === id) ?? evidenceTemplates[0];

  return (
    <>
      <PageHeader eyebrow="Evidence Detail" title={evidence.title} description="Evidence association, status tracking, framework mapping, and upload readiness." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Type" value={evidence.type} detail="Evidence template class." />
        <StatCard label="Framework" value={evidence.framework} detail="Associated framework." />
        <StatCard label="Control" value={evidence.control} detail="Associated control family." />
        <StatCard label="Status" value={evidence.status} detail="Review state." tone={evidence.status === "Current" ? "healthy" : "attention"} />
      </div>
      <Section title="Upload & Association">
        <div className="grid gap-3 text-sm text-[var(--zig-ink-muted)]">
          <p>Upload support is represented by the evidence template intake path. The record can be associated to a framework and control before review.</p>
          <p><StatusBadge tone={evidence.status === "Current" ? "success" : "warning"}>{evidence.status}</StatusBadge></p>
          <Link href="/evidence" className="w-fit rounded-md border border-[var(--zig-border)] px-3 py-2 text-[var(--zig-ink)]">Back to evidence center</Link>
        </div>
      </Section>
    </>
  );
}
