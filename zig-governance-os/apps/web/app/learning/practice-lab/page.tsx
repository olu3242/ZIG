import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";
import { launchLabAction } from "@/app/lib/actions";

export default async function PracticeLabPage() {
  const { context } = await requireTenantContext();
  const services = getZigServices();

  const [scenarios, summary] = await Promise.all([
    services.scenarios.findMany(context),
    services.scenarios.getLearnerLabSummary(context),
  ]);

  const runsByScenario = await Promise.all(scenarios.map((scenario) => services.scenarios.findRuns(context, scenario.id)));
  const allRuns = runsByScenario.flat();

  return (
    <>
      <PageHeader
        eyebrow="GRC Practice Lab"
        title="Hands-on Governance Labs"
        description="Launch a scenario as a lab run, complete its tasks, and submit for a real score and artifact — backed by scenario_runs, lab_tasks, and lab_artifacts."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Labs Launched" value={summary.launchedRunCount} detail="scenario_runs rows created for this tenant/actor." />
        <StatCard label="Labs Completed" value={summary.completedRunCount} detail="Runs scored and marked completed." tone="healthy" />
        <StatCard label="Latest Score" value={summary.latestScore ?? "N/A"} detail="Most recent completed run's score_delta." />
      </div>

      <Section title="Available Scenarios">
        <DataTable
          columns={["Scenario", "Description", "Action"]}
          empty="No scenarios have been defined for this tenant yet."
          rows={scenarios.map((scenario) => [
            scenario.name,
            scenario.description || "—",
            <form key={scenario.id} action={launchLabAction}>
              <input type="hidden" name="scenarioId" value={scenario.id} />
              <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">
                Launch lab
              </button>
            </form>,
          ])}
        />
      </Section>

      <Section title="Your Lab Runs">
        <DataTable
          columns={["Run", "Status", "Score", "Action"]}
          empty="No lab runs yet — launch a scenario above to start one."
          rows={allRuns.map((run) => [
            run.id,
            run.status.replaceAll("_", " "),
            run.scoreDelta,
            <Link key={run.id} href={`/learning/practice-lab/${run.id}`} className="font-medium underline underline-offset-4">
              Open lab session
            </Link>,
          ])}
        />
      </Section>
    </>
  );
}
