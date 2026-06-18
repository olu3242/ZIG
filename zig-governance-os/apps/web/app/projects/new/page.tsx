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
          <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)] lg:col-span-3">
            Generate Project
          </button>
        </form>
      </Section>
    </>
  );
}
