import { CareerReadinessEngine } from "@zig/career-readiness";
import { EmployerMatchingEngine } from "@zig/employer-matching";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { achievements, badges, careerJourneyRoles, careerLevels, careerTracks, certifications, learningPaths, zigScore } from "@/app/lib/mvp-data";

export default async function CareerRootPage() {
  await requireTenantContext();
  const readiness = new CareerReadinessEngine().score({ portfolio: 72, projects: 76, labs: 81, capstones: 69, interview: 66, skills: 74, certifications: 70 });
  const matcher = new EmployerMatchingEngine();

  return (
    <>
      <PageHeader eyebrow="Career Advisor" title="Career & Employment OS" description="Resume, LinkedIn, portfolio, job matching, internship matching, mock interviews, employer readiness, and career tracking." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Career Readiness" value={readiness} detail="Portfolio, projects, labs, capstones, interviews, skills, certifications." tone="healthy" />
        <StatCard label="Job Match" value={matcher.match("job", readiness)} detail="Employer matching signal." />
        <StatCard label="ZIG Score" value={zigScore()} detail="Global employability and practice score." />
      </div>
      <Section title="Career Journey Engine">
        <DataTable columns={["Role", "Generated Plan"]} empty="No roles." rows={careerJourneyRoles.map((role, index) => [role, `${learningPaths[index % learningPaths.length].title} + lab + assessment + certification`])} />
      </Section>
      <Section title="Career Tracks">
        <DataTable columns={["Track", "Recommended Path"]} empty="No tracks." rows={careerTracks.map((track, index) => [track, learningPaths[index]?.title ?? "GRC Analyst Career Launch"])} />
      </Section>
      <Section title="Digital Badges">
        <DataTable columns={["Badge", "Status"]} empty="No badges." rows={badges.map((badge, index) => [badge, <StatusBadge key={badge} tone={index < 3 ? "success" : "neutral"}>{index < 3 ? "earned" : "available"}</StatusBadge>])} />
      </Section>
      <Section title="Achievements">
        <DataTable columns={["Achievement", "XP"]} empty="No achievements." rows={achievements.map((achievement, index) => [achievement, `${250 + index * 50} XP`])} />
      </Section>
      <Section title="Career Levels">
        <DataTable columns={["Level"]} empty="No levels." rows={careerLevels.map((level) => [level])} />
      </Section>
      <Section title="Certifications">
        <DataTable columns={["Certification", "Status"]} empty="No certifications." rows={certifications.map((certification, index) => [certification, index < 3 ? "recommended" : "available"])} />
      </Section>
    </>
  );
}
