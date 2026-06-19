import Link from "next/link";
import { notFound } from "next/navigation";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { completeLabTaskAction, scoreLabAction } from "@/app/lib/actions";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";
import type { LabTaskSubmissionRecord } from "@zig/data-access";

function existingResponse(submissions: LabTaskSubmissionRecord[], labTaskId: string): string {
  const submission = submissions.find((row) => row.labTaskId === labTaskId);
  if (!submission || typeof submission.content !== "object" || submission.content === null) {
    return "";
  }
  const value = (submission.content as Record<string, unknown>).response;
  return typeof value === "string" ? value : "";
}

export default async function LabSessionPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const { context } = await requireTenantContext();
  const services = getZigServices();

  const run = await services.scenarios.findRunById(context, runId);
  if (!run) {
    notFound();
  }

  const [scenario, tasks, submissions, artifacts] = await Promise.all([
    services.scenarios.findById(context, run.scenarioId),
    services.scenarios.findTasks(context, run.scenarioId),
    services.scenarios.findSubmissions(context, runId),
    services.scenarios.findArtifacts(context, runId),
  ]);

  const submittedTaskIds = new Set(submissions.filter((submission) => submission.isComplete).map((submission) => submission.labTaskId));
  const isCompleted = run.status === "completed";

  return (
    <>
      <PageHeader
        eyebrow="Lab Session"
        title={scenario?.name ?? "Lab Run"}
        description={scenario?.description ?? "Complete the tasks below, then submit for scoring."}
        actions={<StatusBadge tone={isCompleted ? "success" : "warning"}>{run.status.replaceAll("_", " ")}</StatusBadge>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Tasks" value={tasks.length} detail="lab_tasks defined for this scenario." />
        <StatCard label="Completed" value={submittedTaskIds.size} detail="lab_task_submissions persisted for this run." tone="healthy" />
        <StatCard label="Score" value={`${run.scoreDelta}%`} detail="scenario_runs.score_delta, written when scored." />
      </div>

      {tasks.length === 0 ? (
        <Section title="Tasks">
          <p className="text-sm text-[var(--zig-ink-muted)]">
            No tasks have been defined for this scenario yet — they must exist in <code>lab_tasks</code> before this
            run can be completed.
          </p>
        </Section>
      ) : (
        <Section title="Tasks">
          <DataTable
            columns={["Task", "Expected Output", "Status", "Action"]}
            empty="No tasks."
            rows={tasks.map((task) => [
              task.title,
              task.expectedOutputType,
              <StatusBadge key={`${task.id}-status`} tone={submittedTaskIds.has(task.id) ? "success" : "warning"}>
                {submittedTaskIds.has(task.id) ? "submitted" : "pending"}
              </StatusBadge>,
              isCompleted ? (
                "—"
              ) : (
                <form key={task.id} action={completeLabTaskAction} className="flex items-center gap-2">
                  <input type="hidden" name="scenarioRunId" value={runId} />
                  <input type="hidden" name="labTaskId" value={task.id} />
                  <input
                    name="response"
                    placeholder={task.instructions || "Your response"}
                    defaultValue={existingResponse(submissions, task.id)}
                    className="rounded-md border border-[var(--zig-border)] px-2 py-1 text-sm"
                    required
                  />
                  <button className="rounded-md border border-[var(--zig-ink)] px-2 py-1 text-xs font-medium">Save</button>
                </form>
              ),
            ])}
          />
        </Section>
      )}

      {!isCompleted ? (
        <Section title="Submit & Score">
          <form action={scoreLabAction} className="flex items-center gap-3">
            <input type="hidden" name="scenarioRunId" value={runId} />
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">
              Submit lab for scoring
            </button>
          </form>
          <p className="mt-3 text-xs text-[var(--zig-ink-muted)]">
            Scoring computes (completed task weight / total task weight) * 100, writes a lab_artifacts row, marks
            this run completed, and updates your career skills signal.
          </p>
        </Section>
      ) : (
        <Section title="Artifact">
          <DataTable
            columns={["Artifact Type", "Score", "Created"]}
            empty="No artifact generated."
            rows={artifacts.map((artifact) => [
              artifact.artifactType.replaceAll("_", " "),
              `${artifact.score}%`,
              new Date(artifact.createdAt).toLocaleString(),
            ])}
          />
        </Section>
      )}

      <Section title="Navigate">
        <Link href="/learning/practice-lab" className="text-sm font-medium underline underline-offset-4">
          Back to Practice Lab
        </Link>
      </Section>
    </>
  );
}
