import { CredentialingPlatform } from "@zig/credentials";
import { EmployerCloud } from "@zig/employer-cloud";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function EmployersPage() {
  await requireTenantContext();
  const employers = new EmployerCloud();
  const credentials = new CredentialingPlatform();

  return (
    <>
      <PageHeader eyebrow="Employer Cloud" title="Employer Network" description="Talent search, candidate discovery, portfolio review, certification verification, skills verification, job posting, and internship programs." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Employer Features" value={employers.features().length} detail="Hiring workflow surface." />
        <StatCard label="Credential Types" value={credentials.credentialTypes().length} detail="Certificates through experience verification." tone="healthy" />
        <StatCard label="Verification" value="Public" detail="Employer and partner verification scoped." />
      </div>
      <Section title="Employer Features">
        <DataTable columns={["Feature"]} empty="No features." rows={employers.features().map((item) => [item.replaceAll("_", " ")])} />
      </Section>
    </>
  );
}
