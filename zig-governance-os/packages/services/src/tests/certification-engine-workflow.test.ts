import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";
import type { CertificationTrackConfig } from "../certificationEligibility";

const TRACK: CertificationTrackConfig = {
  key: "risk_management_associate",
  title: "Risk Management Associate",
  learningPathId: "path_cert",
  knowledgeThreshold: 70,
  skillsThreshold: 70,
  requiresCapstone: true,
  capstoneThreshold: 60,
  badgeKey: "badge_risk_management_associate",
};

async function assertCertificationEngineIsRealAndExplainable(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_cert", actorUserId: "user_cert" };

  await repositories.learningPaths.create(context, {
    id: "path_cert",
    title: "Risk Management Path",
    description: "Risk management curriculum",
    progressPercent: 0,
  });
  await repositories.learningModules.create(context, {
    id: "module_cert_1",
    learningPathId: "path_cert",
    title: "Lesson 1",
    moduleType: "lesson",
    durationMinutes: 10,
  });
  await repositories.learningModules.create(context, {
    id: "module_cert_2",
    learningPathId: "path_cert",
    title: "Lesson 2",
    moduleType: "lesson",
    durationMinutes: 10,
  });

  // --- Empty learner: ineligible, every requirement missing, progress reflects this honestly. ---
  const emptyEligibility = await services.certificationEligibility.evaluateEligibility(context, TRACK);
  if (emptyEligibility.eligible || emptyEligibility.status !== "missing_requirements") {
    throw new Error(`Expected an empty learner to be ineligible with status missing_requirements, got eligible=${emptyEligibility.eligible}, status=${emptyEligibility.status}.`);
  }
  if (emptyEligibility.missingRequirements.length !== 4) {
    throw new Error(`Expected all 4 requirements to be missing for an empty learner, got ${emptyEligibility.missingRequirements.length}.`);
  }

  const emptyProgress = await services.certificationProgress.getProgress(context, TRACK);
  if (emptyProgress.completionPercent !== 0 || emptyProgress.recommendedNextActions.length !== 4) {
    throw new Error("Expected getProgress to reflect 0% completion and 4 recommended actions for an empty learner.");
  }

  // --- Awarding while ineligible must fail loudly, not silently grant a badge. ---
  let threw = false;
  try {
    await services.certificationAwards.awardCertification(context, TRACK);
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected awardCertification to throw for an ineligible learner.");
  }

  // --- Populate real data: both lessons completed, knowledge/skills scores at threshold, graded capstone above threshold. ---
  await repositories.userProgress.create(context, {
    id: "progress_cert_1",
    userId: "user_cert",
    learningPathId: "path_cert",
    moduleId: "module_cert_1",
    lessonId: "module_cert_1",
    status: "completed",
    completedAt: new Date(),
  });
  await repositories.userProgress.create(context, {
    id: "progress_cert_2",
    userId: "user_cert",
    learningPathId: "path_cert",
    moduleId: "module_cert_2",
    lessonId: "module_cert_2",
    status: "completed",
    completedAt: new Date(),
  });
  await repositories.studentTwins.create(context, {
    id: "twin_cert",
    learnerUserId: "user_cert",
    knowledgeScore: 75,
    skillsScore: 80,
    competencyScore: 0,
    portfolioScore: 0,
    certificationScore: 0,
    careerScore: 0,
    behaviorScore: 0,
    confidenceScore: 0,
    learningScore: 0,
  });
  await repositories.capstoneProjects.create(context, {
    id: "capstone_cert",
    learnerUserId: "user_cert",
    title: "Final Capstone",
    status: "graded",
    portfolioScore: 65,
  });

  const eligibleResult = await services.certificationEligibility.evaluateEligibility(context, TRACK);
  if (!eligibleResult.eligible || eligibleResult.status !== "eligible") {
    throw new Error(`Expected a fully-qualified learner to be eligible, got eligible=${eligibleResult.eligible}, status=${eligibleResult.status}, missing=${JSON.stringify(eligibleResult.missingRequirements)}.`);
  }
  if (eligibleResult.missingRequirements.length !== 0) {
    throw new Error("Expected zero missing requirements for a fully-qualified learner.");
  }

  const eligibleProgress = await services.certificationProgress.getProgress(context, TRACK);
  if (eligibleProgress.completionPercent !== 100 || eligibleProgress.estimatedCompletion !== "Complete — ready to award.") {
    throw new Error(`Expected 100% completion and a "ready to award" estimate, got ${eligibleProgress.completionPercent}% / "${eligibleProgress.estimatedCompletion}".`);
  }

  // --- Award: persists a real certification_awards row, idempotent, writes certificationScore. ---
  const award = await services.certificationAwards.awardCertification(context, TRACK);
  if (award.certificationKey !== TRACK.key || award.badgeKey !== TRACK.badgeKey) {
    throw new Error("awardCertification did not persist the expected certification_key/badge_key.");
  }

  const awardsAfterFirst = await services.certificationAwards.getAwards(context);
  if (awardsAfterFirst.length !== 1) {
    throw new Error(`Expected exactly 1 persisted award, found ${awardsAfterFirst.length}.`);
  }

  const secondAward = await services.certificationAwards.awardCertification(context, TRACK);
  if (secondAward.id !== award.id) {
    throw new Error("awardCertification was not idempotent: a second call created a duplicate award.");
  }
  const awardsAfterSecond = await services.certificationAwards.getAwards(context);
  if (awardsAfterSecond.length !== 1) {
    throw new Error(`Expected awarding twice to still result in exactly 1 persisted award, found ${awardsAfterSecond.length}.`);
  }

  const twinsAfterAward = await repositories.studentTwins.findMany(context, { filters: { learnerUserId: "user_cert" } });
  if (twinsAfterAward.length !== 1 || twinsAfterAward[0].certificationScore <= 0) {
    throw new Error("awardCertification did not write a positive certificationScore to student_twins.");
  }

  // --- Tenant isolation: a different tenant must see neither the eligibility data nor the award. ---
  const otherContext = { tenantId: "tenant_cert_other", actorUserId: "user_cert" };
  const otherEligibility = await services.certificationEligibility.evaluateEligibility(otherContext, TRACK);
  if (otherEligibility.eligible) {
    throw new Error("Tenant isolation violated: a different tenant context saw eligibility data from tenant_cert.");
  }
  const otherAwards = await services.certificationAwards.getAwards(otherContext);
  if (otherAwards.length !== 0) {
    throw new Error("Tenant isolation violated: a different tenant context saw certification_awards rows from tenant_cert.");
  }
}

void assertCertificationEngineIsRealAndExplainable();
