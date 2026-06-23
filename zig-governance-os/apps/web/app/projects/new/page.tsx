import { FormField, PageHeader, Section, SelectField } from "@zig/ui";
import { createProjectAction } from "@/app/lib/actions";
import { loadFrameworks } from "@/app/lib/data";

export default async function CreateProjectPage() {
  const frameworks = await loadFrameworks();

  return (
    <>
      <PageHeader
        eyebrow="Project Builder"
        title="Create Project"
        description="Select an industry and framework to create the first tenant-scoped governance project."
      />
      <Section title="Generate Project">
        <form action={createProjectAction} className="grid gap-4 lg:grid-cols-3">
          <FormField label="Project name" name="name" required />
          <SelectField
            label="Industry"
            name="industry"
            options={["SaaS", "Fintech", "Healthcare", "Professional Services"].map((industry) => ({ label: industry, value: industry }))}
          />
          <SelectField
            label="Framework"
            name="frameworkId"
            required
            options={frameworks.map((framework) => ({ label: `${framework.name} ${framework.version}`, value: framework.id }))}
          />
          <SelectField
            label="Status"
            name="status"
            options={[
              { label: "Draft", value: "draft" },
              { label: "Active", value: "active" },
            ]}
          />
          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            <span>Description</span>
            <textarea
              className="min-h-28 rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] px-3 py-2 text-[var(--zig-ink)]"
              name="description"
              placeholder="Describe the governance program, scope, assumptions, and operating objective."
            />
          </label>
          <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)] lg:col-span-3">
            Generate Project
          </button>
        </form>
      </Section>
    </>
  );
}
