import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { labs } from "@/app/lib/mvp-data";

export default async function LabsPage() {
  await requireTenantContext();
  const completed = labs.filter((lab) => lab.score >= 80).length;

  return (
    <>
      <PageHeader eyebrow="Practice Lab" title="Lab Catalog" description="Hands-on GRC practice labs with scenario briefs, tasks, expected deliverables, scoring rubrics, and artifact generation." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Labs" value={labs.length} detail="MVP practice experiences." />
        <StatCard label="Completed" value={completed} detail="Labs with score at or above 80." tone="healthy" />
        <StatCard label="Average Score" value={Math.round(labs.reduce((sum, lab) => sum + lab.score, 0) / labs.length)} detail="Practice readiness signal." />
      </div>
      <Section title="Available Labs">
        <DataTable
          columns={["Lab", "Scenario", "Score", "Status"]}
          empty="No labs configured."
          rows={labs.map((lab) => [
            <Link key={lab.id} href={`/labs/${lab.id}`} className="font-medium underline underline-offset-4">{lab.title}</Link>,
            lab.scenario,
            lab.score,
            <StatusBadge key={`${lab.id}-status`} tone={lab.score >= 80 ? "success" : "warning"}>{lab.score >= 80 ? "complete" : "ready"}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
