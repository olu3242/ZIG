import { FormField, PageHeader, Section } from "@zig/ui";
import { submitTrustRequestAction } from "@/app/lib/actions";
import { findPublishedTrustProfileBySlug } from "@/app/lib/supabase";

export default async function TrustRequestAccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { slug } = await params;
  const { submitted } = await searchParams;
  const profile = await findPublishedTrustProfileBySlug(slug);

  if (!profile) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm text-[var(--zig-ink-muted)]">No published Trust Center was found for this link.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <PageHeader
        eyebrow="Trust Center"
        title={`Request Access — ${profile.organizationName}`}
        description="Request a protected document, an NDA-gated policy, or a completed security questionnaire."
      />

      {submitted === "1" ? (
        <Section title="Request Submitted">
          <p className="text-sm text-[var(--zig-ink-muted)]">
            Your request has been logged and routed for approval. {profile.supportEmail ? `You can also reach ${profile.supportEmail} directly.` : ""}
          </p>
        </Section>
      ) : (
        <Section title="Access Request">
          <form action={submitTrustRequestAction} className="grid gap-4">
            <input type="hidden" name="tenantId" value={profile.tenantId} />
            <input type="hidden" name="projectId" value={profile.projectId} />
            <input type="hidden" name="slug" value={profile.slug} />
            <FormField label="Your Name" name="requesterName" required />
            <FormField label="Your Email" name="requesterEmail" required />
            <FormField label="Company (optional)" name="requesterCompany" />
            <FormField label="Document ID (optional)" name="documentId" />
            <FormField label="Reason for request" name="reason" required />
            <div>
              <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Submit Request</button>
            </div>
          </form>
        </Section>
      )}
    </main>
  );
}
