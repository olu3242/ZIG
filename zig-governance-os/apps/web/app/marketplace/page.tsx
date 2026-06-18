import { MarketplaceEngine, type MarketplaceListing } from "@zig/marketplace";
import { PageHeader, Section, DataTable, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

const listings: MarketplaceListing[] = [
  { id: "iso-accelerator", category: "framework_packs", name: "ISO 27001 Accelerator", version: "1.0.0", monetized: true, licensed: true },
  { id: "soc2-evidence", category: "evidence_packs", name: "SOC 2 Evidence Pack", version: "1.0.0", monetized: true, licensed: true },
  { id: "healthcare-cloud", category: "industry_packs", name: "Healthcare Cloud", version: "0.9.0", monetized: false, licensed: true },
];

export default async function MarketplacePage() {
  const { context } = await requireTenantContext();
  const marketplace = new MarketplaceEngine();

  return (
    <>
      <PageHeader eyebrow="Ecosystem" title="Marketplace" description="Framework packs, control libraries, risk libraries, policy libraries, automation packs, workflow packs, evidence packs, certification packs, industry packs, and training packs." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Listings" value={listings.length} detail="Browse, install, clone, version, review, publish, monetize, license." />
        <StatCard label="Licensed Packs" value={listings.filter((item) => item.licensed).length} detail="Tenant-ready install manifests." tone="healthy" />
        <StatCard label="Industry Clouds" value={10} detail="Healthcare through defense." />
      </div>
      <Section title="Marketplace Catalog">
        <DataTable
          columns={["Pack", "Category", "Version", "Install Key", "License"]}
          empty="No marketplace listings available."
          rows={listings.map((listing) => [
            listing.name,
            listing.category,
            listing.version,
            marketplace.install(listing, context.tenantId),
            <StatusBadge key="license" tone={listing.licensed ? "success" : "warning"}>{listing.licensed ? "Licensed" : "Review"}</StatusBadge>,
          ])}
        />
      </Section>
    </>
  );
}
