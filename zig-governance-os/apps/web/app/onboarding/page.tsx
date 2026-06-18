import { DialogPanel, FormField, PageHeader } from "@zig/ui";
import { onboardingAction } from "@/app/lib/actions";
import { requireSession } from "@/app/lib/auth";

export default async function OnboardingPage() {
  const session = await requireSession();

  return (
    <>
      <PageHeader
        eyebrow="Tenant Onboarding"
        title="Create Organization"
        description={`Complete workspace setup for ${session.email}. Zig will create the tenant, first Tenant Admin profile, and persona context.`}
      />
      <DialogPanel title="Organization Provisioning">
        <form action={onboardingAction} className="grid gap-4">
          <FormField label="Organization name" name="organizationName" required />
          <FormField label="Workspace slug" name="organizationSlug" required />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="First name" name="firstName" required />
            <FormField label="Last name" name="lastName" required />
          </div>
          <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">
            Create organization
          </button>
        </form>
      </DialogPanel>
    </>
  );
}
