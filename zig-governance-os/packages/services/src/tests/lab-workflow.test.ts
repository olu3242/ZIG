import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertLabWorkflowScoresPersistsArtifactAndCareerSignal(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_lab", actorUserId: "user_lab" };

  await repositories.scenarios.create(context, {
    id: "scenario_1",
    projectId: "project_1",
    name: "Incident Response Tabletop",
    description: "Simulated breach response exercise",
    frameworkIds: [],
  });

  await repositories.labTasks.create(context, {
    id: "task_1",
    scenarioId: "scenario_1",
    title: "Identify affected assets",
    instructions: "List the assets impacted by the incident.",
    expectedOutputType: "text",
    weight: 1,
    orderIndex: 0,
  });

  await repositories.labTasks.create(context, {
    id: "task_2",
    scenarioId: "scenario_1",
    title: "Draft containment plan",
    instructions: "Describe containment steps.",
    expectedOutputType: "text",
    weight: 1,
    orderIndex: 1,
  });

  // --- Launch: real scenario_runs row created with status 'running'. ---
  const run = await services.scenarios.launchLab(context, "scenario_1");
  if (run.status !== "running" || run.scenarioId !== "scenario_1") {
    throw new Error("launchLab did not persist a running scenario_run.");
  }

  const fetchedRun = await services.scenarios.findRunById(context, run.id);
  if (!fetchedRun) {
    throw new Error("findRunById did not return the launched run.");
  }

  // --- Tasks defined for the scenario are real, ordered rows. ---
  const tasks = await services.scenarios.findTasks(context, "scenario_1");
  if (tasks.length !== 2 || tasks[0].id !== "task_1") {
    throw new Error("findTasks did not return the persisted, ordered task set.");
  }

  // --- Complete only one of two tasks, then score: expect 50%. ---
  await services.scenarios.completeTask(context, run.id, "task_1", { response: "Web server, database" });

  const submissionsAfterOne = await services.scenarios.findSubmissions(context, run.id);
  if (submissionsAfterOne.length !== 1 || !submissionsAfterOne[0].isComplete) {
    throw new Error("completeTask did not persist a lab_task_submissions row.");
  }

  const partialScore = await services.scenarios.scoreAndComplete(context, run.id, "audit_finding");
  if (partialScore.score !== 50 || partialScore.completedTaskCount !== 1 || partialScore.totalTaskCount !== 2) {
    throw new Error(`Expected a 50% partial score, got ${partialScore.score}% (${partialScore.completedTaskCount}/${partialScore.totalTaskCount}).`);
  }

  const runAfterScore = await services.scenarios.findRunById(context, run.id);
  if (!runAfterScore || runAfterScore.status !== "completed" || runAfterScore.scoreDelta !== 50) {
    throw new Error("scoreAndComplete did not persist the computed score onto scenario_runs.");
  }

  const artifacts = await services.scenarios.findArtifacts(context, run.id);
  if (artifacts.length !== 1 || artifacts[0].artifactType !== "audit_finding" || artifacts[0].score !== 50) {
    throw new Error("scoreAndComplete did not persist the expected lab_artifacts row.");
  }

  const twinsAfterPartial = await repositories.studentTwins.findMany(context, { filters: { learnerUserId: "user_lab" } });
  if (twinsAfterPartial.length !== 1 || twinsAfterPartial[0].skillsScore !== 50) {
    throw new Error("scoreAndComplete did not write the expected skillsScore signal to student_twins.");
  }

  // --- Second run: complete both tasks, expect 100%. ---
  const run2 = await services.scenarios.launchLab(context, "scenario_1");
  await services.scenarios.completeTask(context, run2.id, "task_1", { response: "Web server" });
  await services.scenarios.completeTask(context, run2.id, "task_2", { response: "Isolate VLAN, rotate credentials" });

  const fullScore = await services.scenarios.scoreAndComplete(context, run2.id);
  if (fullScore.score !== 100) {
    throw new Error(`Expected a 100% score for a fully completed run, got ${fullScore.score}%.`);
  }

  const twinsAfterFull = await repositories.studentTwins.findMany(context, { filters: { learnerUserId: "user_lab" } });
  if (twinsAfterFull.length !== 1 || twinsAfterFull[0].skillsScore !== 100) {
    throw new Error("Second scoring pass did not update skillsScore on the existing student_twins row.");
  }

  // --- Re-saving a task submission updates in place rather than duplicating it. ---
  await services.scenarios.completeTask(context, run2.id, "task_1", { response: "Web server (updated)" });
  const submissionsAfterResave = await services.scenarios.findSubmissions(context, run2.id);
  const task1Submissions = submissionsAfterResave.filter((submission) => submission.labTaskId === "task_1");
  if (task1Submissions.length !== 1) {
    throw new Error("completeTask created a duplicate submission instead of updating the existing one.");
  }

  // --- Dashboard summary reflects real launched/completed counts across both runs. ---
  const summary = await services.scenarios.getLearnerLabSummary(context);
  if (summary.launchedRunCount !== 2 || summary.completedRunCount !== 2 || summary.latestScore !== 100) {
    throw new Error(
      `getLearnerLabSummary mismatch: launched=${summary.launchedRunCount}, completed=${summary.completedRunCount}, latestScore=${summary.latestScore}.`,
    );
  }

  // --- Scoring a run with zero defined tasks must not silently report 100%. ---
  await repositories.scenarios.create(context, {
    id: "scenario_empty",
    projectId: "project_1",
    name: "Scenario with no tasks",
    description: "",
    frameworkIds: [],
  });
  const emptyRun = await services.scenarios.launchLab(context, "scenario_empty");
  const emptyScore = await services.scenarios.scoreAndComplete(context, emptyRun.id);
  if (emptyScore.score !== 0) {
    throw new Error(`Expected a 0% score for a scenario with no tasks, got ${emptyScore.score}%.`);
  }
}

void assertLabWorkflowScoresPersistsArtifactAndCareerSignal();
