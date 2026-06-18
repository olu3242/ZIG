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
          {["Organization Admin", "GRC Manager", "Risk Analyst", "Compliance Analyst", "Auditor", "Consultant", "Viewer"].map((role) => (
            <div key={role} className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm">{role}</div>
          ))}
        </div>
      </Section>
    </>
  );
}
