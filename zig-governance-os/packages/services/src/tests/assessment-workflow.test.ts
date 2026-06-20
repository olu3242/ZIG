import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertAssessmentWorkflowScoresAndPersists(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_assessment", actorUserId: "user_assessment" };

  await repositories.learningAssessments.create(context, {
    id: "assessment_1",
    assessmentType: "quiz",
    title: "ISO 27001 Foundations Quiz",
    passingScore: 70,
  });

  await repositories.learningAssessmentQuestions.create(context, {
    id: "question_1",
    assessmentId: "assessment_1",
    prompt: "Which control family addresses access control?",
    options: ["A.5 Organizational", "A.9 Access Control", "A.11 Physical Security"],
    correctOptionIndex: 1,
    weight: 1,
    orderIndex: 0,
  });

  await repositories.learningAssessmentQuestions.create(context, {
    id: "question_2",
    assessmentId: "assessment_1",
    prompt: "ISO 27001 is primarily a standard for what?",
    options: ["Information security management systems", "Financial auditing", "Quality manufacturing"],
    correctOptionIndex: 0,
    weight: 1,
    orderIndex: 1,
  });

  // --- Loading the assessment returns the real persisted questions, not a stub. ---
  const loaded = await services.assessments.findAssessment(context, "assessment_1");
  if (!loaded || loaded.questions.length !== 2) {
    throw new Error("findAssessment did not return the persisted question set.");
  }

  // --- Failing attempt: 1 of 2 correct -> 50%, below the 70% passing score. ---
  const failingAttempt = await services.assessments.submitAttempt(context, "assessment_1", [
    { questionId: "question_1", selectedOptionIndex: 1 }, // correct
    { questionId: "question_2", selectedOptionIndex: 2 }, // wrong
  ]);

  if (failingAttempt.score !== 50 || failingAttempt.passed) {
    throw new Error(`Expected a 50% failing score, got ${failingAttempt.score}% passed=${failingAttempt.passed}.`);
  }

  if (failingAttempt.remediationSkillIds.length !== 1 || failingAttempt.remediationSkillIds[0] !== "question_2") {
    throw new Error("Failing attempt did not record the missed question as a remediation target.");
  }

  const resultsAfterFirst = await repositories.learningAssessmentResults.findMany(context, {
    filters: { learnerUserId: "user_assessment" },
  });
  if (resultsAfterFirst.length !== 1 || resultsAfterFirst[0].score !== 50) {
    throw new Error("submitAttempt did not persist a learning_assessment_results row with the computed score.");
  }

  const twinAfterFirst = await repositories.studentTwins.findMany(context, { filters: { learnerUserId: "user_assessment" } });
  if (twinAfterFirst.length !== 1 || twinAfterFirst[0].knowledgeScore !== 50) {
    throw new Error("Failing attempt did not write the expected knowledgeScore to student_twins.");
  }

  // --- Passing attempt: both correct -> 100%. ---
  const passingAttempt = await services.assessments.submitAttempt(context, "assessment_1", [
    { questionId: "question_1", selectedOptionIndex: 1 },
    { questionId: "question_2", selectedOptionIndex: 0 },
  ]);

  if (passingAttempt.score !== 100 || !passingAttempt.passed) {
    throw new Error(`Expected a 100% passing score, got ${passingAttempt.score}% passed=${passingAttempt.passed}.`);
  }

  const twinAfterSecond = await repositories.studentTwins.findMany(context, { filters: { learnerUserId: "user_assessment" } });
  if (twinAfterSecond.length !== 1 || twinAfterSecond[0].knowledgeScore !== 100) {
    throw new Error("Passing attempt did not update knowledgeScore on the existing student_twins row.");
  }

  const summary = await services.assessments.getLearnerAssessmentSummary(context);
  if (summary.attemptCount !== 2 || summary.passedCount !== 1 || summary.latestScore !== 100) {
    throw new Error(
      `getLearnerAssessmentSummary mismatch: attemptCount=${summary.attemptCount}, passedCount=${summary.passedCount}, latestScore=${summary.latestScore}.`,
    );
  }

  // --- Unanswered/unknown question ids never silently score as correct. ---
  const blankAttempt = await services.assessments.submitAttempt(context, "assessment_1", []);
  if (blankAttempt.score !== 0 || blankAttempt.passed) {
    throw new Error(`Expected a 0% score for a blank submission, got ${blankAttempt.score}% passed=${blankAttempt.passed}.`);
  }
}

void assertAssessmentWorkflowScoresAndPersists();
