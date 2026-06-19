import { DataTable, FormField, PageHeader, Section, SelectField, StatCard, StatusBadge } from "@zig/ui";
import { reviewEvidenceAction, uploadEvidenceAction } from "@/app/lib/actions";
import { loadEvidence } from "@/app/lib/data";

function latestReviewStatus(reviews: { status: string; reviewedAt?: Date }[]): string {
  if (reviews.length === 0) {
    return "no_review";
  }
  return reviews[reviews.length - 1].status;
}

export default async function EvidencePage() {
  const { controls, evidence, reviewsByEvidenceId } = await loadEvidence();

  const evidenceCount = evidence.length;
  const approvedCount = evidence.filter((row) => row.status === "approved").length;
  const pendingReviewCount = evidenceCount - approvedCount;

  return (
    <>
      <PageHeader
        eyebrow="Evidence"
        title="Evidence Workspace"
        description="Record evidence against a control, link it into the governance chain, and review/approve submissions."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Evidence Records" value={evidenceCount} detail="Real rows in the evidence table." />
        <StatCard label="Pending Review" value={pendingReviewCount} detail="Not yet approved." tone={pendingReviewCount > 0 ? "attention" : "healthy"} />
        <StatCard label="Approved" value={approvedCount} detail="evidence_reviews status = approved." tone="healthy" />
      </div>

      <Section title="Record New Evidence">
        {controls.length === 0 ? (
          <p className="text-sm text-[var(--zig-ink-muted)]">
            No controls exist yet for this tenant — a control must exist before evidence can be attached to it.
          </p>
        ) : (
          <form action={uploadEvidenceAction} className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Control"
              name="controlId"
              required
              options={controls.map((control) => ({ label: `${control.controlId} — ${control.title}`, value: control.id }))}
            />
            <FormField label="Evidence Title" name="title" required />
            <FormField label="Source URL / Reference (optional)" name="sourceUri" />
            <div className="flex items-end">
              <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">
                Record Evidence
              </button>
            </div>
          </form>
        )}
        <p className="mt-3 text-xs text-[var(--zig-ink-muted)]">
          No file-storage table exists in this schema yet, so evidence is recorded as a title + optional source
          reference (URL or document path) rather than an uploaded binary. See the certification doc for the
          KEEP/EXTEND decision.
        </p>
      </Section>

      <Section title="Evidence Register">
        <DataTable
          columns={["Title", "Control", "Status", "Latest Review", "Review"]}
          empty="No evidence recorded yet."
          rows={evidence.map((row) => {
            const reviews = reviewsByEvidenceId.get(row.id) ?? [];
            const latest = latestReviewStatus(reviews);
            const control = controls.find((candidate) => candidate.id === row.controlId);
            return [
              row.title,
              control ? `${control.controlId} — ${control.title}` : row.controlId,
              <StatusBadge key={`${row.id}-status`} tone={row.status === "approved" ? "success" : "warning"}>
                {row.status}
              </StatusBadge>,
              <StatusBadge key={`${row.id}-review`} tone={latest === "approved" ? "success" : latest === "rejected" ? "warning" : "neutral"}>
                {latest.replaceAll("_", " ")}
              </StatusBadge>,
              row.status === "approved" ? (
                "—"
              ) : (
                <div key={`${row.id}-actions`} className="flex gap-2">
                  <form action={reviewEvidenceAction}>
                    <input type="hidden" name="evidenceId" value={row.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <button className="rounded-md border border-[var(--zig-ink)] px-2 py-1 text-xs font-medium">Approve</button>
                  </form>
                  <form action={reviewEvidenceAction}>
                    <input type="hidden" name="evidenceId" value={row.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <button className="rounded-md border border-[var(--zig-border)] px-2 py-1 text-xs font-medium">Reject</button>
                  </form>
                </div>
              ),
            ];
          })}
        />
      </Section>
    </>
  );
}
