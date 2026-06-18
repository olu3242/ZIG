import { UniversityPlatform } from "@zig/university-platform";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function UniversityPage() {
  await requireTenantContext();
  const platform = new UniversityPlatform();

  return (
    <>
      <PageHeader eyebrow="University Platform" title="Academic Learning OS" description="Courses, labs, assignments, capstones, exams, certifications, portfolios, internships, faculty, career services, and employers." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="University Roles" value={platform.users().length} detail="Students through employers." />
        <StatCard label="Academic Objects" value={8} detail="Courses through internships." tone="healthy" />
        <StatCard label="Career Services" value="Enabled" detail="Employer and internship workflow." />
      </div>
      <Section title="University Users">
        <DataTable columns={["Role"]} empty="No roles." rows={platform.users().map((item) => [item.replaceAll("_", " ")])} />
      </Section>
    </>
  );
}
