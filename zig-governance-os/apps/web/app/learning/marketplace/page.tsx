import { LearningMarketplace } from "@zig/learning-marketplace";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function LearningMarketplacePage() {
  await requireTenantContext();
  const marketplace = new LearningMarketplace();
  const catalog = marketplace.catalog();

  return (
    <>
      <PageHeader eyebrow="Learning Marketplace" title="Learning Asset Catalog" description="Courses, labs, scenarios, playbooks, templates, assessments, and certification packs." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assets" value={catalog.length} detail="Seed catalog." />
        <StatCard label="Asset Types" value={7} detail="Course through certification pack." />
        <StatCard label="Publishing" value="Scoped" detail="Instructor OS handoff." />
      </div>
      <Section title="Catalog">
        <DataTable columns={["Title", "Type", "Level"]} empty="No assets." rows={catalog.map((asset) => [asset.title, asset.type, asset.level])} />
      </Section>
    </>
  );
}
