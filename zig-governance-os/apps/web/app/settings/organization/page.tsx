import { PageHeader, Section, StatCard } from "@zig/ui";
import { loadDashboard } from "@/app/lib/data";

export default async function OrganizationSettingsPage() {
  const { tenant, persona, frameworks } = await loadDashboard();

  return (
    <>
      <PageHeader
        eyebrow="Organization Settings"
        title={tenant?.name ?? "Organization"}
        description="Tenant-scoped settings for branding, framework preferences, risk appetite, and governance targets."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Tenant Status" value={tenant?.status ?? "unknown"} detail={`Workspace slug: ${tenant?.slug ?? "unassigned"}`} tone="healthy" />
        <StatCard label="Persona" value={persona} detail="Loaded from the tenant-scoped user profile." />
        <StatCard label="Frameworks" value={frameworks.length} detail="Available tenant framework records." />
        <StatCard label="Tenant ID" value={tenant?.id.slice(0, 8) ?? "missing"} detail="Tenant isolation boundary." />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Branding">
          <p className="text-sm text-[var(--zig-ink-muted)]">Branding settings will load from tenant settings once the settings service is implemented.</p>
        </Section>

        <Section title="Framework Preferences">
          <div className="grid gap-2 text-sm">
            {frameworks.map((framework) => (
              <div key={framework.id} className="flex items-center justify-between rounded-md border border-[var(--zig-border)] px-3 py-2">
                <span>{framework.name}</span>
                <span className="font-mono text-xs uppercase text-[var(--zig-teal)]">
                  available
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Risk Appetite">
          <p className="text-sm leading-6 text-[var(--zig-ink-muted)]">
            Risk appetite will be configured through tenant settings in a later governance-core batch.
          </p>
        </Section>

        <Section title="Governance Targets">
          <div className="grid gap-2 text-sm">
            <div className="rounded-md border border-[var(--zig-border)] px-3 py-2">Minimum health score: not configured</div>
            <div className="rounded-md border border-[var(--zig-border)] px-3 py-2">Evidence coverage: not configured</div>
            <div className="rounded-md border border-[var(--zig-border)] px-3 py-2">Assessment completion: not configured</div>
          </div>
        </Section>
      </div>

      <Section title="Access Control Check">
        <p className="text-sm leading-6 text-[var(--zig-ink-muted)]">
          Tenant settings are protected by the same tenant context used by dashboard, projects, and frameworks.
        </p>
      </Section>
    </>
  );
}
