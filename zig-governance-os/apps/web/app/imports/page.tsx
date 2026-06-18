import { importStages, type ImportType } from "@zig/imports";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

const importTypes: ImportType[] = ["projects", "frameworks", "controls", "risks", "issues", "vendors", "evidence", "users", "assets", "policies", "tasks", "audits"];

export default async function ImportsPage() {
  await requireTenantContext();

  return (
    <>
      <PageHeader
        eyebrow="Imports"
        title="CSV Import Center"
        description="Enterprise onboarding pipeline for upload, validation, preview, mapping, transformation, import, verification, and audit."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Supported Types" value={importTypes.length} detail="Projects, controls, risks, users, assets, evidence, and more." />
        <StatCard label="Pipeline Stages" value={importStages.length} detail="Every import follows a verifiable staged lifecycle." tone="healthy" />
        <StatCard label="Failure Handling" value="Partial" detail="Invalid rows can be rejected while valid rows proceed." />
      </div>
      <Section title="Import Types">
        <DataTable
          columns={["Type", "Validation", "Audit"]}
          empty="No import types configured."
          rows={importTypes.map((type) => [type, "required fields, tenant, owner, type, relationships", <StatusBadge key={type} tone="success">on</StatusBadge>])}
        />
      </Section>
    </>
  );
}
