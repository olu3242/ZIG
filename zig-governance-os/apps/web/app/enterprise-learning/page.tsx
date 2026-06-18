import { CohortEngine } from "@zig/cohorts";
import { MentorshipCloud } from "@zig/mentorship-cloud";
import { TrainingMarketplace } from "@zig/training-marketplace";
import { TrainingPartnerNetwork } from "@zig/training-partners";
import { WorkforceAnalytics } from "@zig/workforce-analytics";
import { WorkforceDevelopmentEngine } from "@zig/workforce-development";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function EnterpriseLearningPage() {
  await requireTenantContext();
  const workforce = new WorkforceDevelopmentEngine();
  const analytics = new WorkforceAnalytics().score({ learningVelocity: 78, certificationRate: 68, skillGrowth: 74, careerProgression: 61, placementRate: 55, promotionRate: 49, employerSatisfaction: 80, trainingRoi: 72 });
  const marketplace = new TrainingMarketplace();
  const partners = new TrainingPartnerNetwork();
  const cohorts = new CohortEngine();
  const mentors = new MentorshipCloud();

  return (
    <>
      <PageHeader eyebrow="Enterprise Training Cloud" title="Workforce Development Command Center" description="Academies, cohorts, mentors, students, certifications, employers, partners, revenue, and workforce readiness." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Workforce Outputs" value={workforce.outputs().length} detail="Readiness and risk outputs." />
        <StatCard label="Workforce Score" value={analytics} detail="Enterprise learning ROI signal." tone="healthy" />
        <StatCard label="Marketplace Assets" value={marketplace.assets().length} detail="Courses through mentorship programs." />
        <StatCard label="Partner Types" value={partners.types().length} detail="Universities through corporate academies." />
        <StatCard label="Cohort Features" value={cohorts.features().length} detail="Live learning model." />
        <StatCard label="Mentorship Roles" value={mentors.roles().length} detail="Mentor through employer." />
      </div>
      <Section title="Workforce Outputs">
        <DataTable columns={["Output"]} empty="No outputs." rows={workforce.outputs().map((item) => [item.replaceAll("_", " ")])} />
      </Section>
    </>
  );
}
