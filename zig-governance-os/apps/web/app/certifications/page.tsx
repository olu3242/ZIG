import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { loadCertifications } from "@/app/lib/data";
import { awardCertificationAction } from "@/app/lib/actions";

const STATUS_TONE: Record<string, "success" | "warning" | "neutral"> = {
  eligible: "success",
  in_progress: "warning",
  missing_requirements: "neutral",
};

export default async function CertificationsPage() {
  const { tracks, awards, eligibilityByTrackKey, progressByTrackKey } = await loadCertifications();
  const awardedKeys = new Set(awards.map((award) => award.certificationKey));
  const eligibleCount = tracks.filter((track) => eligibilityByTrackKey.get(track.key)?.eligible).length;

  return (
    <>
      <PageHeader
        eyebrow="Certification Center"
        title="Certifications"
        description="Eligibility is derived live from lesson completion, knowledge/skills scores, and graded capstones — never a stale flag. Awarding re-checks eligibility and writes a real certification_awards record plus the certificationScore signal."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Certification Tracks" value={tracks.length} detail="One per learning path." />
        <StatCard label="Eligible Now" value={eligibleCount} detail="Tracks where every requirement is met." tone="healthy" />
        <StatCard label="Awarded" value={awards.length} detail="Certifications already awarded to you." />
      </div>
      <Section title="Eligibility & Progress">
        <DataTable
          columns={["Track", "Status", "Completion", "Missing Requirements", "Estimated Completion", "Award"]}
          empty="No learning paths exist yet — enroll in a learning path to see certification tracks here."
          rows={tracks.map((track) => {
            const eligibility = eligibilityByTrackKey.get(track.key);
            const progress = progressByTrackKey.get(track.key);
            const awarded = awardedKeys.has(track.key);
            return [
              track.title,
              <StatusBadge key={`${track.key}-status`} tone={STATUS_TONE[eligibility?.status ?? "missing_requirements"]}>
                {awarded ? "awarded" : eligibility?.status ?? "missing_requirements"}
              </StatusBadge>,
              `${progress?.completionPercent ?? 0}%`,
              progress?.missingRequirements.length ? progress.missingRequirements.join(" ") : "None",
              progress?.estimatedCompletion ?? "Unknown",
              awarded ? (
                <span key={`${track.key}-awarded`} className="text-sm text-[var(--zig-ink-muted)]">Already awarded</span>
              ) : (
                <form key={`${track.key}-award`} action={awardCertificationAction}>
                  <input type="hidden" name="learningPathId" value={track.learningPathId} />
                  <button
                    type="submit"
                    disabled={!eligibility?.eligible}
                    className="rounded-md bg-[var(--zig-ink)] px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Award
                  </button>
                </form>
              ),
            ];
          })}
        />
      </Section>
      <Section title="Recommended Next Actions">
        <DataTable
          columns={["Track", "Next Action"]}
          empty="No outstanding requirements — every track is either eligible or already awarded."
          rows={tracks.flatMap((track) => {
            const progress = progressByTrackKey.get(track.key);
            return (progress?.recommendedNextActions ?? []).map((action, index) => [
              index === 0 ? track.title : "",
              action,
            ]);
          })}
        />
      </Section>
      <Section title="Awarded Certifications">
        <DataTable
          columns={["Certification", "Badge", "Awarded At"]}
          empty="No certifications awarded yet."
          rows={awards.map((award) => [
            award.certificationKey,
            award.badgeKey,
            new Date(award.awardedAt).toLocaleString(),
          ])}
        />
      </Section>
    </>
  );
}
