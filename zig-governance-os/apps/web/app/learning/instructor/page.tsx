import { InstructorOS } from "@zig/instructor-os";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function InstructorPage() {
  await requireTenantContext();
  const instructor = new InstructorOS();
  const builders = instructor.builders();

  return (
    <>
      <PageHeader eyebrow="Instructor OS" title="Instructor Workspace" description="Instructor dashboard, course builder, lab builder, scenario builder, assessment builder, and student analytics." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Builders" value={builders.length} detail="Authoring surfaces." />
        <StatCard label="Student Analytics" value="Enabled" detail="Learning analytics feed." tone="healthy" />
        <StatCard label="Publishing" value="Draft" detail="Marketplace handoff scoped." />
      </div>
      <Section title="Builder Tools">
        <DataTable columns={["Builder", "Status"]} empty="No builders." rows={builders.map((builder) => [builder.replaceAll("_", " "), <StatusBadge key={builder} tone="success">Enabled</StatusBadge>])} />
      </Section>
    </>
  );
}
