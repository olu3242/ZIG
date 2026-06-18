import { CareerReadinessEngine } from "@zig/career-readiness";
import { EmployerMatchingEngine } from "@zig/employer-matching";
import { EmploymentOS } from "@zig/employment";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function CareerRootPage() {
  await requireTenantContext();
  const readiness = new CareerReadinessEngine().score({ portfolio: 72, projects: 76, labs: 81, capstones: 69, interview: 66, skills: 74, certifications: 70 });
  const employment = new EmploymentOS();
  const matcher = new EmployerMatchingEngine();

  return (
    <>
      <PageHeader eyebrow="Career Advisor" title="Career & Employment OS" description="Resume, LinkedIn, portfolio, job matching, internship matching, mock interviews, employer readiness, and career tracking." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Career Readiness" value={readiness} detail="Portfolio, projects, labs, capstones, interviews, skills, certifications." tone="healthy" />
        <StatCard label="Job Match" value={matcher.match("job", readiness)} detail="Employer matching signal." />
        <StatCard label="Employment Components" value={employment.components().length} detail="Career operating model." />
      </div>
      <Section title="Employment Components">
        <DataTable columns={["Component"]} empty="No components." rows={employment.components().map((component) => [component.replaceAll("_", " ")])} />
      </Section>
    </>
  );
}
