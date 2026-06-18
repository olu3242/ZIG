import { canApprove, canEdit, canView } from "@zig/governance-engine";
import { PageHeader, Section, StatCard } from "@zig/ui";
import { frameworks } from "@/app/lib/mock-data";
import { getCurrentRole, getCurrentTenant, getCurrentTenantSettings, getCurrentUser } from "@/app/lib/session";

export default function OrganizationSettingsPage() {
  const tenant = getCurrentTenant();
  const user = getCurrentUser();
  const role = getCurrentRole();
  const settings = getCurrentTenantSettings();
  const subject = { user, tenantId: tenant.id };

  return (
    <>
      <PageHeader
        eyebrow="Organization Settings"
        title={tenant.name}
        description="Tenant-scoped settings for branding, framework preferences, risk appetite, and governance targets."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Tenant Status" value={tenant.status} detail={`Workspace slug: ${tenant.slug}`} tone="healthy" />
        <StatCard label="Current Role" value={user.role} detail={`${role.permissions.length} permissions in mock RBAC.`} />
        <StatCard label="Can Edit Settings" value={canEdit(subject, "settings") ? "Yes" : "No"} detail="Resolved through RBAC engine." />
        <StatCard label="Can Approve" value={canApprove(subject, "settings") ? "Yes" : "No"} detail="Approval access for tenant changes." />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Branding">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-md border border-[var(--zig-border)] px-3 py-2">
              <span>Display name</span>
              <span className="font-medium">{settings.branding.displayName}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-[var(--zig-border)] px-3 py-2">
              <span>Primary color</span>
              <span className="font-mono">{settings.branding.primaryColor}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-[var(--zig-border)] px-3 py-2">
              <span>Accent color</span>
              <span className="font-mono">{settings.branding.accentColor}</span>
            </div>
          </div>
        </Section>

        <Section title="Framework Preferences">
          <div className="grid gap-2 text-sm">
            {frameworks.map((framework) => (
              <div key={framework.id} className="flex items-center justify-between rounded-md border border-[var(--zig-border)] px-3 py-2">
                <span>{framework.name}</span>
                <span className="font-mono text-xs uppercase text-[var(--zig-teal)]">
                  {settings.preferredFrameworkIds.includes(framework.id) ? "preferred" : "available"}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Risk Appetite">
          <p className="text-sm leading-6 text-[var(--zig-ink-muted)]">
            Current appetite is <span className="font-medium text-[var(--zig-ink)]">{settings.riskAppetite}</span>. Future risk scoring will use this value to prioritize treatment recommendations.
          </p>
        </Section>

        <Section title="Governance Targets">
          <div className="grid gap-2 text-sm">
            <div className="rounded-md border border-[var(--zig-border)] px-3 py-2">Minimum health score: {settings.governanceTargets.minimumHealthScore}</div>
            <div className="rounded-md border border-[var(--zig-border)] px-3 py-2">Evidence coverage: {settings.governanceTargets.evidenceCoverage}%</div>
            <div className="rounded-md border border-[var(--zig-border)] px-3 py-2">Assessment completion: {settings.governanceTargets.assessmentCompletion}%</div>
          </div>
        </Section>
      </div>

      <Section title="Access Control Check">
        <p className="text-sm leading-6 text-[var(--zig-ink-muted)]">
          {canView(subject, "settings")
            ? "The current user can view tenant settings through the mock role context."
            : "The current user cannot view tenant settings through the mock role context."}
        </p>
      </Section>
    </>
  );
}
