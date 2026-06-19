import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { risks, scoreRisk } from "@/app/lib/mvp-data";

export default async function RiskRegisterPage() {
  await requireTenantContext();
  const openRisks = risks.filter((risk) => risk.status !== "Closed").length;
  const highRisks = risks.filter((risk) => scoreRisk(risk) >= 15).length;

  return (
    <>
      <PageHeader
        eyebrow="Risk Register"
        title="Risk Register"
        description="Create, score, treat, and monitor governance risks with owner, treatment, and status tracking."
        actions={<Link className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm" href="/risk/new">Create risk</Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Risks" value={risks.length} detail="Seeded MVP risk register." />
        <StatCard label="Open" value={openRisks} detail="Risks requiring owner attention." tone="attention" />
        <StatCard label="High Score" value={highRisks} detail="Likelihood x impact is 15 or higher." />
      </div>
      <Section title="Register">
        <DataTable
          columns={["Risk", "Owner", "Score", "Treatment", "Status"]}
          empty="No risks created."
          rows={risks.map((risk) => [
            <Link key={risk.id} href={`/risk/${risk.id}`} className="font-medium underline underline-offset-4">{risk.title}</Link>,
            risk.owner,
            scoreRisk(risk),
            risk.treatment,
            <StatusBadge key={`${risk.id}-status`} tone={risk.status === "Closed" ? "success" : "warning"}>{risk.status}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
