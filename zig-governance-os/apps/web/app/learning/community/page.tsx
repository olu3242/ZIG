import { CommunityOS } from "@zig/community-os";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function CommunityPage() {
  await requireTenantContext();
  const community = new CommunityOS();
  const plan = community.programPlan();

  return (
    <>
      <PageHeader eyebrow="Community OS" title="Cohorts & Mentorship" description="Bootcamps, live classes, office hours, assignments, group projects, mentor matching, project reviews, and mock interviews." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Programs" value={plan.length} detail="Community operating model." />
        <StatCard label="Mentor Match" value={community.mentorMatchScore(0.8, 0.6)} detail="Skill and availability fit." tone="healthy" />
        <StatCard label="Peer Review" value="Enabled" detail="Project review workflow." />
      </div>
      <Section title="Program Plan">
        <DataTable columns={["Program"]} empty="No programs." rows={plan.map((item) => [item.replaceAll("_", " ")])} />
      </Section>
    </>
  );
}
