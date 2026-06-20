import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertCareerMaterialsAreGeneratedFromRealPortfolioData(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_career", actorUserId: "user_career" };

  let threw = false;
  try {
    await services.portfolio.generateCareerMaterials(context);
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected generateCareerMaterials to throw before a portfolio score has been computed.");
  }

  await repositories.scenarios.create(context, {
    id: "scenario_career",
    projectId: "project_career",
    name: "Vendor Risk Scenario",
    description: "Vendor risk lab",
    frameworkIds: [],
  });
  const run = await repositories.scenarioRuns.create(context, {
    id: "run_career",
    projectId: "project_career",
    scenarioId: "scenario_career",
    status: "completed",
    scoreDelta: 80,
    startedAt: new Date(),
  });
  await repositories.labArtifacts.create(context, {
    id: "artifact_career",
    scenarioRunId: run.id,
    artifactType: "gap_assessment",
    content: {},
    score: 80,
  });
  await repositories.capstoneProjects.create(context, {
    id: "capstone_career",
    learnerUserId: "user_career",
    title: "Vendor Risk Capstone",
    status: "submitted",
    portfolioScore: 90,
  });

  await services.portfolio.computePortfolioScore(context);
  const portfolio = await services.portfolio.generateCareerMaterials(context);

  if (!portfolio.resumeSummary.includes("Vendor Risk Capstone")) {
    throw new Error(`Expected resumeSummary to reference the real top capstone title, got: "${portfolio.resumeSummary}"`);
  }
  if (!portfolio.linkedinSummary.includes("Vendor Risk Capstone")) {
    throw new Error(`Expected linkedinSummary to reference the real top capstone title, got: "${portfolio.linkedinSummary}"`);
  }

  const persisted = await services.portfolio.getPortfolio(context);
  if (!persisted || persisted.resumeSummary !== portfolio.resumeSummary) {
    throw new Error("generateCareerMaterials did not persist resumeSummary to the learner_portfolios row.");
  }
}

async function assertCoachCareerBranchUsesRealReadinessAndResumeData(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_coach_career", actorUserId: "user_coach_career" };

  const { welcomeMessage: noTwinReply } = await services.coach.startConversation(context, "general");
  const { coachMessage: noSignalReply } = await services.coach.sendMessage(context, noTwinReply.conversationId, "How is my career readiness?");
  if (!noSignalReply.content.includes("complete a lesson")) {
    throw new Error(`Expected a no-signal career reply when no student_twins row exists, got: "${noSignalReply.content}"`);
  }

  await repositories.studentTwins.create(context, {
    id: "twin_coach_career",
    learnerUserId: "user_coach_career",
    knowledgeScore: 80,
    skillsScore: 80,
    competencyScore: 0,
    portfolioScore: 80,
    certificationScore: 80,
    careerScore: 0,
    behaviorScore: 0,
    confidenceScore: 0,
    learningScore: 80,
  });

  const { coachMessage: noResumeReply } = await services.coach.sendMessage(context, noTwinReply.conversationId, "What's my career readiness?");
  if (!noResumeReply.content.includes("80/100")) {
    throw new Error(`Expected the readiness average (80) in the reply, got: "${noResumeReply.content}"`);
  }
  if (!noResumeReply.content.includes("don't have a generated resume")) {
    throw new Error(`Expected a prompt to generate a resume when none exists, got: "${noResumeReply.content}"`);
  }

  await repositories.learnerPortfolios.create(context, {
    id: "portfolio_coach_career",
    learnerUserId: "user_coach_career",
    validationStatus: "unvalidated",
    portfolioScore: 80,
    resumeSummary: "Portfolio score 80/100, led by capstone test project.",
    linkedinSummary: "Hands-on practitioner.",
  });

  const { coachMessage: withResumeReply } = await services.coach.sendMessage(context, noTwinReply.conversationId, "How's my resume looking for a job?");
  if (!withResumeReply.content.includes("Portfolio score 80/100, led by capstone test project.")) {
    throw new Error(`Expected the real resumeSummary text quoted in the reply, got: "${withResumeReply.content}"`);
  }
  const confidence = withResumeReply.confidence ?? 0;
  if (confidence <= 0 || confidence > 1) {
    throw new Error(`Expected a confidence in (0, 1], got ${confidence}.`);
  }
}

void assertCareerMaterialsAreGeneratedFromRealPortfolioData();
void assertCoachCareerBranchUsesRealReadinessAndResumeData();
