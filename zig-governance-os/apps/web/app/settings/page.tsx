import Link from "next/link";
import { PageHeader, Section, StatCard } from "@zig/ui";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tenant Administration"
        title="Settings"
        description="Foundation shell for tenant, role, and project configuration before Supabase-backed administration is added."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Tenant" value="Demo" detail="Tenant-scoped workspace." />
        <StatCard label="Roles" value="7" detail="Documented MVP role set." />
        <StatCard label="Users" value="5" detail="Mock cross-functional team." />
      </div>
      <Section title="Role Model">
        <div className="grid gap-2 md:grid-cols-2">
          {["Platform Admin", "Tenant Admin", "GRC Manager", "Auditor", "Analyst", "Learner"].map((role) => (
            <div key={role} className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm">{role}</div>
          ))}
        </div>
      </Section>

      <Section
        title="Organization Settings"
        action={<Link className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]" href="/settings/organization">Open</Link>}
      >
        <p className="text-sm leading-6 text-[var(--zig-ink-muted)]">
          Configure tenant branding, framework preferences, risk appetite, and governance targets.
        </p>
      </Section>
    </>
  );
}
