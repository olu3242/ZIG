import { BaseService } from "./BaseService";
import { GovernanceService } from "./GovernanceService";
import { ScenarioService } from "./ScenarioService";
import type {
  ScenarioAttemptRecord,
  ScenarioDecisionRecord,
  ScenarioOutcomeRecord,
  ScenarioRunRecord,
  ScenarioTemplateRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";

export class ScenarioAttemptService extends BaseService<ScenarioAttemptRecord> {
  constructor(
    attemptRepository: TenantRepository<ScenarioAttemptRecord>,
    private readonly decisionRepository: TenantRepository<ScenarioDecisionRecord>,
    private readonly outcomeRepository: TenantRepository<ScenarioOutcomeRecord>,
    private readonly runRepository: TenantRepository<ScenarioRunRecord>,
    private readonly templateRepository: TenantRepository<ScenarioTemplateRecord>,
    private readonly scenarioService: ScenarioService,
    private readonly governanceService: GovernanceService,
  ) {
    super(attemptRepository);
  }

  async startAttempt(
    context: TenantContext,
    params: { scenarioId: string; templateId: string; projectId: string; learnerId: string },
  ): Promise<ScenarioAttemptRecord> {
    const template = await this.templateRepository.findById(context, params.templateId);
    if (!template) {
      throw new Error(`scenario template ${params.templateId} not found`);
    }

    return this.repository.create(context, {
      id: crypto.randomUUID(),
      projectId: params.projectId,
      scenarioId: params.scenarioId,
      templateId: params.templateId,
      learnerId: params.learnerId,
      status: "in_progress",
      currentDecisionPointId: template.decisionPointIds[0] ?? null,
      riskScore: template.startingScores.riskScore,
      healthScore: template.startingScores.healthScore,
      readinessScore: template.startingScores.readinessScore,
      startedAt: new Date(),
    });
  }

  async recordDecision(
    context: TenantContext,
    attemptId: string,
    decision: { decisionPointId: string; optionChosen: string; prompt: string; optionsPresented: ScenarioDecisionRecord["optionsPresented"]; rationale: string },
  ): Promise<ScenarioDecisionRecord> {
    const attempt = await this.repository.findById(context, attemptId);
    if (!attempt) {
      throw new Error(`scenario attempt ${attemptId} not found`);
    }

    const option = decision.optionsPresented.find((o) => o.id === decision.optionChosen);
    if (!option) {
      throw new Error(`option ${decision.optionChosen} not present at decision point ${decision.decisionPointId}`);
    }

    const decisionRecord = await this.decisionRepository.create(context, {
      id: crypto.randomUUID(),
      attemptId,
      decisionPointId: decision.decisionPointId,
      prompt: decision.prompt,
      optionsPresented: decision.optionsPresented,
      optionChosen: decision.optionChosen,
      scoreDeltas: option.scoreDeltas,
      rationale: decision.rationale,
      decidedAt: new Date(),
    });

    const template = await this.templateRepository.findById(context, attempt.templateId);
    const decisionPoints = template?.decisionPointIds ?? [];
    const nextIndex = decisionPoints.indexOf(decision.decisionPointId) + 1;
    const nextDecisionPointId = decisionPoints[nextIndex] ?? null;

    await this.repository.update(context, attemptId, {
      riskScore: attempt.riskScore + option.scoreDeltas.riskScore,
      healthScore: attempt.healthScore + option.scoreDeltas.healthScore,
      readinessScore: attempt.readinessScore + option.scoreDeltas.readinessScore,
      currentDecisionPointId: nextDecisionPointId,
    });

    return decisionRecord;
  }

  findDecisions(context: TenantContext, attemptId: string): Promise<ScenarioDecisionRecord[]> {
    return this.decisionRepository.findMany(context, { filters: { attemptId } });
  }

  async completeAttempt(context: TenantContext, attemptId: string): Promise<ScenarioOutcomeRecord> {
    const attempt = await this.repository.findById(context, attemptId);
    if (!attempt) {
      throw new Error(`scenario attempt ${attemptId} not found`);
    }

    const template = await this.templateRepository.findById(context, attempt.templateId);
    const decisions = await this.findDecisions(context, attemptId);

    const completedAt = new Date();
    await this.repository.update(context, attemptId, {
      status: "completed",
      currentDecisionPointId: null,
      completedAt,
    });

    const readinessScoreDelta = template
      ? attempt.readinessScore - template.startingScores.readinessScore
      : attempt.readinessScore;

    const grade: ScenarioOutcomeRecord["grade"] =
      readinessScoreDelta > 5 ? "strong" : readinessScoreDelta >= 0 ? "adequate" : "weak";

    const outcome = await this.outcomeRepository.create(context, {
      id: crypto.randomUUID(),
      attemptId,
      learnerId: attempt.learnerId,
      scenarioId: attempt.scenarioId,
      templateId: attempt.templateId,
      finalRiskScore: attempt.riskScore,
      finalHealthScore: attempt.healthScore,
      readinessScoreDelta,
      decisionsCount: decisions.length,
      competenciesDemonstrated: template?.competencyIds ?? [],
      grade,
      summary: `Completed ${template?.name ?? "scenario"} with ${decisions.length} decisions; readiness delta ${readinessScoreDelta}.`,
      completedAt,
    });

    await this.runRepository.create(context, {
      id: crypto.randomUUID(),
      scenarioId: attempt.scenarioId,
      projectId: attempt.projectId,
      status: "completed",
      scoreDelta: readinessScoreDelta,
      startedAt: attempt.startedAt,
      completedAt,
    });

    return outcome;
  }

  private readGovernanceContext(context: TenantContext, projectId: string) {
    return this.governanceService.findMany(context).then((rows) => rows.filter((r) => r.projectId === projectId));
  }
}
