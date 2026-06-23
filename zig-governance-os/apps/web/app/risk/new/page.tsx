import { FormField, PageHeader, Section, SelectField } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function NewRiskPage() {
  await requireTenantContext();

  return (
    <>
      <PageHeader eyebrow="Risk Register" title="Create Risk" description="Capture the core fields needed for MVP risk scoring and treatment tracking." />
      <Section title="Risk Intake">
        <form className="grid gap-4 md:grid-cols-2">
          <FormField label="Risk title" name="title" required />
          <FormField label="Owner" name="owner" required />
          <SelectField label="Likelihood" name="likelihood" options={[1, 2, 3, 4, 5].map((value) => ({ label: String(value), value: String(value) }))} />
          <SelectField label="Impact" name="impact" options={[1, 2, 3, 4, 5].map((value) => ({ label: String(value), value: String(value) }))} />
          <SelectField label="Treatment" name="treatment" options={["Mitigate", "Transfer", "Accept", "Avoid"].map((value) => ({ label: value, value }))} />
          <SelectField label="Status" name="status" options={["Open", "In Treatment", "Accepted", "Closed"].map((value) => ({ label: value, value }))} />
          <button className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm font-medium md:col-span-2" type="button">
            Save draft risk
          </button>
        </form>
      </Section>
    </>
  );
}
