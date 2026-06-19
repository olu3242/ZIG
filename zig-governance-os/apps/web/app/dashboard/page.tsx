import Link from "next/link";
import { DataTable, GovernanceScoreWidget, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { loadDashboard } from "@/app/lib/data";

const quickActions = [
  ["Create Project", "/projects/new"],
  ["Framework Library", "/frameworks"],
  ["Learning Center", "/learning"],
  ["Scenario Lab", "/scenarios"],
  ["Practice Lab", "/learning/practice-lab"],
  ["AI Coach", "/ai-command"],
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Learning Paths Enrolled" value={stats.enrolledPathCount} detail="Distinct learning paths with a user_progress row for this user." />
        <StatCard label="Lessons Completed" value={stats.completedLessonCount} detail="Lesson completions persisted to user_progress." tone="healthy" />
        <StatCard label="Assessment Attempts" value={stats.assessmentAttemptCount} detail="Submitted attempts persisted to learning_assessment_results." />
        <StatCard label="Assessments Passed" value={stats.assessmentPassedCount} detail="Attempts that met the assessment's passing score." tone="healthy" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Labs Launched" value={stats.labLaunchedCount} detail="scenario_runs created from the Practice Lab." />
        <StatCard label="Labs Completed" value={stats.labCompletedCount} detail="Lab runs scored with a persisted lab_artifacts row." tone="healthy" />
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
