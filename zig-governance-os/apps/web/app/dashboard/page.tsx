import Link from "next/link";
import { DataTable, GovernanceScoreWidget, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { loadDashboard } from "@/app/lib/data";
import { evidenceTemplates, labs, learningPaths, risks, scoreRisk, vendors } from "@/app/lib/mvp-data";

const quickActions = [
  ["Create Project", "/projects/new"],
  ["Framework Library", "/frameworks"],
  ["Learning Center", "/learning"],
  ["Practice Labs", "/labs"],
  ["Risk Register", "/risk"],
  ["Vendor Inventory", "/vendors"],
  ["AI Coach", "/coach"],
] as const;

export default async function DashboardPage() {
  const { tenant, persona, projects, frameworks, stats } = await loadDashboard();

  return (
    <>
      <PageHeader
        eyebrow="Mission Control"
        title="Zig Dashboard"
        description={`Tenant-scoped operating view for ${tenant?.name ?? "your workspace"} with persona ${persona}.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GovernanceScoreWidget score={stats.governanceScore} detail="Initial score is generated once the first project and framework assignment exist." />
        <StatCard label="Projects" value={stats.projectCount} detail={`${stats.activeProjects} active governance project(s).`} tone="healthy" />
        <StatCard label="Frameworks" value={stats.frameworkCount} detail="Tenant framework registry rows available for selection." />
        <StatCard label="Onboarding" value={stats.onboardingState} detail="Vertical slice readiness for the current tenant." />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Learning Progress" value={`${Math.round(learningPaths.reduce((sum, path) => sum + path.progress, 0) / learningPaths.length)}%`} detail={`${learningPaths.length} MVP learning paths available.`} tone="healthy" />
        <StatCard label="Lab Progress" value={`${labs.filter((lab) => lab.score >= 80).length}/${labs.length}`} detail="Completed practice labs." />
        <StatCard label="Risk Summary" value={risks.filter((risk) => scoreRisk(risk) >= 15).length} detail="High-score risks in the MVP register." tone="attention" />
        <StatCard label="Vendor Summary" value={vendors.length} detail={`${vendors.filter((vendor) => vendor.inherentRisk === "High").length} high-risk vendors.`} />
        <StatCard label="Evidence Summary" value={evidenceTemplates.length} detail={`${evidenceTemplates.filter((item) => item.status === "Current").length} current evidence records.`} />
        <StatCard label="Career Progress" value="5 tracks" detail="Analyst, Consultant, Manager, Director, vCISO." tone="healthy" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Projects">
          <DataTable
            columns={["Project", "Framework", "Status"]}
            empty="Create a project to activate the governance dashboard."
            rows={projects.map((project) => [
              <Link key={project.id} href={`/projects/${project.id}`} className="font-medium underline underline-offset-4">{project.name}</Link>,
              frameworks.find((framework) => framework.id === project.frameworkId)?.name ?? project.frameworkId,
              <StatusBadge key={`${project.id}-status`} tone="success">{project.status}</StatusBadge>,
            ])}
          />
        </Section>

        <Section title="Quick Actions">
          <div className="grid gap-2">
            {quickActions.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-md border border-[var(--zig-border)] px-3 py-2 text-sm font-medium hover:border-[var(--zig-ink)]">
                {label}
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
