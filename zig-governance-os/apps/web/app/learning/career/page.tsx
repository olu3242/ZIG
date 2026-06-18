import { CareerOS } from "@zig/career-os";
import { PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function CareerPage() {
  await requireTenantContext();
  const career = new CareerOS();
  const readiness = career.readiness({ portfolioScore: 78, certificationReadiness: 72, interviewReadiness: 68, practicalExperience: 81 });

  return (
    <>
      <PageHeader eyebrow="Career OS" title="Career Readiness" description="Portfolio validation, resume generation, LinkedIn positioning, job matching, internship matching, and employer readiness." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Career Readiness" value={readiness} detail="Portfolio, certification, interview, practical experience." tone="healthy" />
        <StatCard label="Resume Headline" value="Ready" detail={career.resumeHeadline("GRC Analyst", "control mapping")} />
        <StatCard label="Employment Pipeline" value="Scoped" detail="Employer portal contract ready." />
      </div>
      <Section title="Outcome Model">
        <p className="text-sm leading-7 text-[var(--zig-ink-muted)]">Assessment and lab evidence flow into portfolio validation, then into certification readiness and job readiness scoring.</p>
      </Section>
    </>
  );
}
