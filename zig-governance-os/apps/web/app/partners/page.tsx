import { PartnerCloud, type PartnerProfile } from "@zig/partners";
import { PageHeader, Section, DataTable, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

const partners: PartnerProfile[] = [
  { type: "consulting", certified: true, revenueShareBps: 1500 },
  { type: "audit", certified: true, revenueShareBps: 1200 },
  { type: "technology", certified: false, revenueShareBps: 800 },
];

export default async function PartnersPage() {
  await requireTenantContext();
  const cloud = new PartnerCloud();
  return (
    <>
      <PageHeader eyebrow="Partner Cloud" title="Partner Ecosystem" description="Partner portal foundation for lead sharing, revenue sharing, partner certification, marketplace publishing, and analytics." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Partner Types" value={8} detail="Consulting, audit, implementation, technology, MSP, MSSP, training, channel." />
        <StatCard label="Active Profiles" value={partners.length} detail="Seed partner profiles." />
        <StatCard label="Certified" value={partners.filter((partner) => partner.certified).length} detail="Certification-ready partners." tone="healthy" />
      </div>
      <Section title="Partner Profiles">
        <DataTable
          columns={["Type", "Certification", "Revenue Share", "Partner Score"]}
          empty="No partners available."
          rows={partners.map((partner) => [
            partner.type,
            <StatusBadge key="certified" tone={partner.certified ? "success" : "warning"}>{partner.certified ? "Certified" : "Pending"}</StatusBadge>,
            `${partner.revenueShareBps / 100}%`,
            cloud.score(partner),
          ])}
        />
      </Section>
    </>
  );
}
