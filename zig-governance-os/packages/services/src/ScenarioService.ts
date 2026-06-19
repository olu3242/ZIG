import { BaseService } from "./BaseService";
import type {
  LabArtifactRecord,
  LabTaskRecord,
  LabTaskSubmissionRecord,
  ScenarioRecord,
  ScenarioRunRecord,
  StudentTwinRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";
import type { LabArtifactType } from "@zig/types";

export interface LabScoreResult {
  artifact: LabArtifactRecord;
  score: number;
  completedTaskCount: number;
  totalTaskCount: number;
}

/**
 * Real lab launch/complete/score/persist logic for the existing scenarios/scenario_runs
 * tables (202606180001_batch_21_core_data_platform.sql). EXTEND decision: this stays on
 * ScenarioService rather than a new LabService because scenario_runs already IS the lab
 * run record (status/score_delta/started_at/completed_at) — a separate LabService would
 * either duplicate that state or have to reach into ScenarioService's repositories
 * anyway. See docs/certification/LAB_WORKFLOW_CERTIFICATION.md for the full decision note.
 */
export class ScenarioService extends BaseService<ScenarioRecord> {
  constructor(
    scenarioRepository: TenantRepository<ScenarioRecord>,
    private readonly runRepository: TenantRepository<ScenarioRunRecord>,
    private readonly taskRepository: TenantRepository<LabTaskRecord>,
    private readonly submissionRepository: TenantRepository<LabTaskSubmissionRecord>,
    private readonly artifactRepository: TenantRepository<LabArtifactRecord>,
    private readonly studentTwinRepository: TenantRepository<StudentTwinRecord>,
  ) {
    super(scenarioRepository);
  }

  findRuns(context: TenantContext, scenarioId: string): Promise<ScenarioRunRecord[]> {
    return this.runRepository.findMany(context, { filters: { scenarioId } });
  }

  findRunById(context: TenantContext, scenarioRunId: string): Promise<ScenarioRunRecord | null> {
    return this.runRepository.findById(context, scenarioRunId);
  }

  /** Real tasks defined for a scenario, ordered the way they should be presented/completed. */
  async findTasks(context: TenantContext, scenarioId: string): Promise<LabTaskRecord[]> {
    const tasks = await this.taskRepository.findMany(context, { filters: { scenarioId } });
    return tasks.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  /** Real submissions persisted so far for a given scenario_run. */
  findSubmissions(context: TenantContext, scenarioRunId: string): Promise<LabTaskSubmissionRecord[]> {
    return this.submissionRepository.findMany(context, { filters: { scenarioRunId } });
  }

  findArtifacts(context: TenantContext, scenarioRunId: string): Promise<LabArtifactRecord[]> {
    return this.artifactRepository.findMany(context, { filters: { scenarioRunId } });
  }

  /**
   * Launch a lab: creates a real scenario_runs row with status 'running'. Reuses the
   * existing scenario_runs table rather than inventing a parallel "lab_runs" table.
   */
  async launchLab(context: TenantContext, scenarioId: string): Promise<ScenarioRunRecord> {
    const scenario = await this.repository.findById(context, scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found.`);
    }

    return this.runRepository.create(context, {
      id: crypto.randomUUID(),
      projectId: scenario.projectId,
      scenarioId,
      status: "running",
      scoreDelta: 0,
      startedAt: new Date(),
    });
  }

  /**
   * Persist a learner's submission for one task within a lab run. Idempotent per
   * (scenarioRunId, labTaskId): if a submission already exists it is updated in place
   * rather than creating a duplicate row, so re-saving a task does not inflate the task
   * count used for scoring.
   */
  async completeTask(
    context: TenantContext,
    scenarioRunId: string,
    labTaskId: string,
    submission: Record<string, unknown>,
  ): Promise<LabTaskSubmissionRecord> {
    const userId = context.actorUserId;
    const existing = await this.submissionRepository.findMany(context, {
      filters: { scenarioRunId, labTaskId },
    });

    if (existing[0]) {
      const updated = await this.submissionRepository.update(context, existing[0].id, {
        content: submission,
        isComplete: true,
      });
      if (!updated) {
        throw new Error(`Failed to update submission ${existing[0].id}.`);
      }
      return updated;
    }

    return this.submissionRepository.create(context, {
      id: crypto.randomUUID(),
      scenarioRunId,
      labTaskId,
      submittedBy: userId,
      content: submission,
      isComplete: true,
    });
  }

  /**
   * Scores a lab run from its REAL completed task submissions (weight of completed
   * tasks / weight of all defined tasks * 100 — no hardcoded average), marks the
   * scenario_run completed, writes a real lab_artifacts row, and updates the learner's
   * career signal (student_twins.skillsScore) — mirroring how AssessmentService writes
   * knowledgeScore and LearningService writes learningScore/careerScore.
   */
  async scoreAndComplete(
    context: TenantContext,
    scenarioRunId: string,
    artifactType: LabArtifactType = "gap_assessment",
  ): Promise<LabScoreResult> {
    const run = await this.runRepository.findById(context, scenarioRunId);
    if (!run) {
      throw new Error(`Scenario run ${scenarioRunId} not found.`);
    }

    const tasks = await this.taskRepository.findMany(context, { filters: { scenarioId: run.scenarioId } });
    const submissions = await this.submissionRepository.findMany(context, { filters: { scenarioRunId } });
    const submittedTaskIds = new Set(submissions.filter((submission) => submission.isComplete).map((submission) => submission.labTaskId));

    const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
    const earnedWeight = tasks
      .filter((task) => submittedTaskIds.has(task.id))
      .reduce((sum, task) => sum + task.weight, 0);

    const score = totalWeight === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100);

    const updatedRun = await this.runRepository.update(context, scenarioRunId, {
      status: "completed",
      scoreDelta: score,
      completedAt: new Date(),
    });
    if (!updatedRun) {
      throw new Error(`Failed to mark scenario run ${scenarioRunId} completed.`);
    }

    const artifactContent = {
      scenarioId: run.scenarioId,
      taskResults: tasks.map((task) => ({
        taskId: task.id,
        title: task.title,
        completed: submittedTaskIds.has(task.id),
        weight: task.weight,
      })),
    };

    const artifact = await this.artifactRepository.create(context, {
      id: crypto.randomUUID(),
      scenarioRunId,
      artifactType,
      content: artifactContent,
      score,
    });

    await this.updateCareerSignal(context, score);

    return {
      artifact,
      score,
      completedTaskCount: submittedTaskIds.size,
      totalTaskCount: tasks.length,
    };
  }

  /**
   * Writes the lab score onto student_twins.skillsScore — the component score this
   * workflow owns (Learning owns learningScore/careerScore, Assessments owns
   * knowledgeScore; labs are hands-on applied practice, which maps to "skills" rather
   * than "competency" — competencyScore is left for a future holistic rollup per the
   * certification doc's KEEP/EXTEND/MERGE/REMOVE note).
   */
  private async updateCareerSignal(context: TenantContext, score: number): Promise<void> {
    const userId = context.actorUserId;
    if (!userId) {
      throw new Error("A signed-in actor is required to record a lab career signal.");
    }

    const existing = await this.studentTwinRepository.findMany(context, { filters: { learnerUserId: userId } });
    const twin = existing[0];

    if (twin) {
      await this.studentTwinRepository.update(context, twin.id, { skillsScore: score });
      return;
    }

    await this.studentTwinRepository.create(context, {
      id: crypto.randomUUID(),
      learnerUserId: userId,
      knowledgeScore: 0,
      skillsScore: score,
      competencyScore: 0,
      portfolioScore: 0,
      certificationScore: 0,
      careerScore: 0,
      behaviorScore: 0,
      confidenceScore: 0,
      learningScore: 0,
    });
  }

  /** Real, tenant-scoped summary for the dashboard: labs the actor has completed. */
  async getLearnerLabSummary(
    context: TenantContext,
  ): Promise<{ launchedRunCount: number; completedRunCount: number; latestScore: number | null }> {
    const runs = await this.runRepository.findMany(context);
    const completed = runs.filter((run) => run.status === "completed");

    return {
      launchedRunCount: runs.length,
      completedRunCount: completed.length,
      latestScore: completed.length > 0 ? completed[completed.length - 1].scoreDelta : null,
    };
  }
}
