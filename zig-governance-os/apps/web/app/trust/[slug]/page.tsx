import Link from "next/link";
import { DataTable, GovernanceScoreWidget, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { loadPublicTrustPortal } from "@/app/lib/data";

export default async function TrustPortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portal = await loadPublicTrustPortal(slug);

  if (!portal) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm text-[var(--zig-ink-muted)]">No published Trust Center was found for this link.</p>
      </main>
    );
  }

  const { profile, documents, complianceCenter, governance, vendorRisk } = portal;
  const readyFrameworkCount = complianceCenter.filter((row) => row.roadmapStatus === "ready").length;

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <PageHeader
        eyebrow="Trust Center"
        title={profile.organizationName}
        description={profile.tagline ?? "Security, compliance, and governance maturity overview."}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {governance ? <GovernanceScoreWidget score={governance.score} detail={governance.explanation} /> : null}
        <StatCard label="Frameworks Ready" value={`${readyFrameworkCount}/${complianceCenter.length}`} detail="Roadmap status across all tracked frameworks." />
        <StatCard label="Vendor Risk" value={vendorRisk.averageRiskScore} detail={`${vendorRisk.vendorCount} vendor(s), ${vendorRisk.openFindingCount} open finding(s).`} />
      </div>

      <Section title="Compliance Coverage">
        <DataTable
          columns={["Framework", "Coverage", "Roadmap Status"]}
          empty="No frameworks tracked yet."
          rows={complianceCenter.map((row) => [
            row.framework.name,
            `${row.coverage.coveragePercent}%`,
            <StatusBadge key={row.framework.id} tone={row.roadmapStatus === "ready" ? "success" : row.roadmapStatus === "in_progress" ? "warning" : "neutral"}>
              {row.roadmapStatus.replace("_", " ")}
            </StatusBadge>,
          ])}
        />
      </Section>

      <Section title="Public Documents">
        <DataTable
          columns={["Document", "Category"]}
          empty="No public documents have been published yet."
          rows={documents.map((document) => [document.title, document.category.replace(/_/g, " ")])}
        />
      </Section>

      <Section title="Need a document or completed questionnaire?">
        <p className="text-sm text-[var(--zig-ink-muted)]">
          <Link href={`/trust/${slug}/request-access`} className="font-medium underline">
            Submit an access request
          </Link>{" "}
          for protected documents, NDAs, or a security questionnaire response.
        </p>
      </Section>
    </main>
  );
}
