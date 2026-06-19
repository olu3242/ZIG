import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { loadDashboard } from "@/app/lib/data";
import { assessments, evidenceTemplates, labs, learningPaths, risks, vendors, zigScore } from "@/app/lib/mvp-data";

export default async function MissionControlPage() {
  const { projects } = await loadDashboard();

  return (
    <>
      <PageHeader
        eyebrow="Mission Control"
        title="Executive Mission Control"
        description="Single-pane-of-glass view across learning, risk, compliance, labs, career, evidence, and vendors."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="ZIG Score" value={zigScore()} detail="Weighted launch readiness score." tone="healthy" />
        <StatCard label="Projects" value={projects.length} detail="Tenant-scoped projects visible to Mission Control." />
        <StatCard label="Learning" value={learningPaths.length} detail="Active learning paths." />
        <StatCard label="Assessments" value={assessments.length} detail="Knowledge checks and scenario exams." />
        <StatCard label="Labs" value={labs.length} detail="Practice labs with deliverables." />
        <StatCard label="Risk" value={risks.length} detail="Risk register records." />
        <StatCard label="Evidence" value={evidenceTemplates.length} detail="Evidence templates and artifacts." />
        <StatCard label="Vendors" value={vendors.length} detail="Vendor risk inventory." />
      </div>
      <Section title="Launch Workflows">
        <DataTable
          columns={["Workflow", "Route"]}
          empty="No workflows."
          rows={[
            ["Learn", <Link key="learn" href="/learning" className="underline underline-offset-4">/learning</Link>],
            ["Assess", <Link key="assess" href="/assessment" className="underline underline-offset-4">/assessment</Link>],
            ["Practice", <Link key="labs" href="/labs" className="underline underline-offset-4">/labs</Link>],
            ["Map Frameworks", <Link key="mapper" href="/framework-mapper" className="underline underline-offset-4">/framework-mapper</Link>],
            ["Build Portfolio", <Link key="portfolio" href="/portfolio" className="underline underline-offset-4">/portfolio</Link>],
            ["Report", <Link key="reports" href="/reports" className="underline underline-offset-4">/reports</Link>],
          ]}
        />
      </Section>
    </>
  );
}
