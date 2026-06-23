import Link from "next/link";
import { DialogPanel, PageHeader } from "@zig/ui";
import { requireSession } from "@/app/lib/auth";

export default async function OnboardingAccessPage() {
  const session = await requireSession();

  return (
    <>
      <PageHeader
        eyebrow="Onboarding Repair"
        title="Access Setup"
        description={`Zig authenticated ${session.email}, but membership or role assignment could not be confirmed.`}
      />
      <DialogPanel title="Access repair required">
        <div className="grid gap-4 text-sm leading-6 text-[var(--zig-ink-muted)]">
          <p>Zig attempted to repair your membership and default role. The access layer is not ready yet.</p>
          <p>Continue setup to create tenant context, then retry dashboard access.</p>
          <Link className="w-fit rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]" href="/onboarding">
            Continue access setup
          </Link>
        </div>
      </DialogPanel>
    </>
  );
}
