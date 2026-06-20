import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertPortfolioScoreIsRealWeightedAndPersisted(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_portfolio", actorUserId: "user_portfolio" };

  // --- Empty learner: every input is 0, score is 0, not null/100. ---
  const emptyResult = await services.portfolio.computePortfolioScore(context);
  if (emptyResult.breakdown.portfolioScore !== 0) {
    throw new Error(`Expected an empty learner to score 0, got ${emptyResult.breakdown.portfolioScore}.`);
  }
  if (
    emptyResult.breakdown.lessonCompletionPercent !== 0 ||
    emptyResult.breakdown.assessmentPassRatePercent !== 0 ||
    emptyResult.breakdown.labAverageScorePercent !== 0 ||
    emptyResult.breakdown.capstoneScorePercent !== 0
  ) {
    throw new Error("Expected every input to be 0 for an empty learner, not null/100.");
  }

  const emptyPortfolio = await services.portfolio.getPortfolio(context);
  if (!emptyPortfolio || emptyPortfolio.portfolioScore !== 0) {
    throw new Error("computePortfolioScore did not persist a learner_portfolios row for an empty learner.");
  }

  const emptyTwins = await repositories.studentTwins.findMany(context, { filters: { learnerUserId: "user_portfolio" } });
  if (emptyTwins.length !== 1 || emptyTwins[0].portfolioScore !== 0) {
    throw new Error("computePortfolioScore did not write portfolioScore to student_twins for an empty learner.");
  }

  // --- Populate real data: one completed lesson (of 2 modules), one passed assessment of 1, one lab artifact at 80, one capstone at 60. ---
  await repositories.learningPaths.create(context, {
    id: "path_portfolio",
    title: "Risk Management Path",
    description: "Risk management curriculum",
    progressPercent: 0,
  });
  await repositories.learningModules.create(context, {
    id: "module_1",
    learningPathId: "path_portfolio",
    title: "Lesson 1",
    moduleType: "lesson",
    durationMinutes: 10,
  });
  await repositories.learningModules.create(context, {
    id: "module_2",
    learningPathId: "path_portfolio",
    title: "Lesson 2",
    moduleType: "lesson",
    durationMinutes: 10,
  });
  await repositories.userProgress.create(context, {
    id: "progress_1",
    userId: "user_portfolio",
    learningPathId: "path_portfolio",
    moduleId: "module_1",
    lessonId: "module_1",
    status: "completed",
    completedAt: new Date(),
  });

  await repositories.learningAssessmentResults.create(context, {
    id: "result_1",
    assessmentId: "assessment_1",
    learnerUserId: "user_portfolio",
    score: 90,
    passed: true,
    remediationSkillIds: [],
  });

  await repositories.scenarios.create(context, {
    id: "scenario_portfolio",
    projectId: "project_portfolio",
    name: "Vendor Risk Scenario",
    description: "Vendor risk lab",
    frameworkIds: [],
  });
  const run = await repositories.scenarioRuns.create(context, {
    id: "run_1",
    projectId: "project_portfolio",
    scenarioId: "scenario_portfolio",
    status: "completed",
    scoreDelta: 80,
    startedAt: new Date(),
  });
  await repositories.labArtifacts.create(context, {
    id: "artifact_1",
    scenarioRunId: run.id,
    artifactType: "gap_assessment",
    content: {},
    score: 80,
  });

  await repositories.capstoneProjects.create(context, {
    id: "capstone_1",
    learnerUserId: "user_portfolio",
    title: "Final Capstone",
    status: "submitted",
    portfolioScore: 60,
  });

  const populated = await services.portfolio.computePortfolioScore(context);
  if (populated.breakdown.lessonCompletionPercent !== 50) {
    throw new Error(`Expected 50% lesson completion (1 of 2 modules), got ${populated.breakdown.lessonCompletionPercent}.`);
  }
  if (populated.breakdown.assessmentPassRatePercent !== 100) {
    throw new Error(`Expected 100% assessment pass rate (1 of 1 passed), got ${populated.breakdown.assessmentPassRatePercent}.`);
  }
  if (populated.breakdown.labAverageScorePercent !== 80) {
    throw new Error(`Expected 80% average lab score, got ${populated.breakdown.labAverageScorePercent}.`);
  }
  if (populated.breakdown.capstoneScorePercent !== 60) {
    throw new Error(`Expected 60% capstone score, got ${populated.breakdown.capstoneScorePercent}.`);
  }

  const expectedScore = Math.round(0.3 * 50 + 0.3 * 100 + 0.3 * 80 + 0.1 * 60);
  if (populated.breakdown.portfolioScore !== expectedScore) {
    throw new Error(`Expected weighted portfolio score ${expectedScore}, got ${populated.breakdown.portfolioScore}.`);
  }

  // --- Persisted, not just returned: re-reads must reflect the same value, updating the existing row rather than duplicating it. ---
  const persistedPortfolio = await services.portfolio.getPortfolio(context);
  if (!persistedPortfolio || persistedPortfolio.id !== emptyPortfolio.id || persistedPortfolio.portfolioScore !== expectedScore) {
    throw new Error("computePortfolioScore did not update the existing learner_portfolios row in place.");
  }

  const allPortfolios = await repositories.learnerPortfolios.findMany(context, { filters: { learnerUserId: "user_portfolio" } });
  if (allPortfolios.length !== 1) {
    throw new Error(`Expected exactly one persisted learner_portfolios row, found ${allPortfolios.length}.`);
  }

  const persistedTwins = await repositories.studentTwins.findMany(context, { filters: { learnerUserId: "user_portfolio" } });
  if (persistedTwins.length !== 1 || persistedTwins[0].portfolioScore !== expectedScore) {
    throw new Error("computePortfolioScore did not update the existing student_twins.portfolioScore in place.");
  }
}

void assertPortfolioScoreIsRealWeightedAndPersisted();
