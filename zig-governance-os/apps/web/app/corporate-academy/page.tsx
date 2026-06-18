import { CorporateAcademyPlatform } from "@zig/corporate-academies";
import { TrainingCloud } from "@zig/training-cloud";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function CorporateAcademyPage() {
  await requireTenantContext();
  const academies = new CorporateAcademyPlatform();
  const cloud = new TrainingCloud();

  return (
    <>
      <PageHeader eyebrow="Corporate Academy" title="Enterprise GRC Academy" description="Internal academies for compliance, risk, audit, security, privacy, and leadership with role-based learning and internal credentials." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Academy Types" value={academies.academyTypes().length} detail="Internal GRC academy models." />
        <StatCard label="Training Cloud Scopes" value={cloud.scopes().length} detail="Department through customer academies." tone="healthy" />
        <StatCard label="Credentials" value="Internal" detail="Skills tracking and internal credentials." />
      </div>
      <Section title="Academy Types">
        <DataTable columns={["Academy"]} empty="No academies." rows={academies.academyTypes().map((item) => [item])} />
      </Section>
    </>
  );
}
