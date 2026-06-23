import type { AgentRunRecord } from "@zig/agent-runtime";

/**
 * Deterministic-but-unique fixture id generator. No production IDs are ever hardcoded —
 * every id used by the dispatcher's default fixtures is generated here at call time.
 */
export function randomId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function fixtureTenantId(): string {
  return randomId("tenant");
}

export function fixtureOrganizationId(): string {
  return randomId("org");
}

export function fixtureUserId(): string {
  return randomId("user");
}

export function fixtureFrameworkCode(): string {
  return "soc2";
}

export function fixtureEvidenceInput() {
  return {
    evidenceId: randomId("evidence"),
    controlId: randomId("control"),
    frameworkId: fixtureFrameworkCode(),
    exists: true,
    expiresAt: undefined as Date | undefined,
    reviewStatus: "pending" as const,
  };
}

export function fixtureFrameworkMappingInput(subjectId = randomId("control")) {
  return {
    subjectType: "control" as const,
    subjectId,
    frameworkCode: fixtureFrameworkCode(),
    coverage: 70,
    readiness: 65,
    controlCoverage: 70,
    evidenceCoverage: 60,
    gapCount: 2,
  };
}

export function fixtureRiskScoreInput() {
  return {
    likelihood: 4,
    impact: 4,
    controlEffectiveness: 40,
    treatmentEffectiveness: 30,
  };
}

export function fixtureControlAssessmentInput() {
  return {
    implementation: 60,
    testPassRate: 55,
    evidenceCoverage: 50,
    maturity: 50,
    hasOpenException: false,
  };
}

export function fixturePolicyCoverageInput() {
  return {
    requiredPolicies: 10,
    publishedPolicies: 8,
    overdueReviews: 1,
  };
}

export function fixtureEvidenceHealthInput() {
  return {
    exists: true,
    expiresAt: undefined as Date | undefined,
    reviewStatus: "pending" as const,
  };
}

export function fixtureFrameworkReadinessInput() {
  return {
    frameworkCode: fixtureFrameworkCode() as "soc2",
    coverage: 70,
    readiness: 65,
    controlCoverage: 70,
    evidenceCoverage: 60,
    gapCount: 2,
  };
}

export function fixtureCertificationReadinessInput() {
  return {
    knowledge: 70,
    practicalSkills: 65,
    labCompletion: 60,
    scenarioCompletion: 55,
    capstones: 50,
    interviewReadiness: 60,
  };
}

export function fixtureSkillSignals() {
  return [
    { skillId: randomId("skill"), score: 55, confidence: 0.8 },
    { skillId: randomId("skill"), score: 80, confidence: 0.9 },
  ];
}

export function fixtureCareerReadinessInput() {
  return {
    portfolioScore: 70,
    certificationReadiness: 65,
    interviewReadiness: 60,
    practicalExperience: 55,
  };
}

export function fixtureBoardReportInput() {
  return {
    reportType: "compliance" as const,
    outputs: ["pdf" as const],
    aggregateReadiness: 72,
    weakAreas: ["evidence"],
  };
}

/** Synthetic failed-run record shape used to exercise the agent.failed -> GovernanceSupervisorAgent path. */
export function fixtureFailedRunRecord(overrides: Partial<AgentRunRecord> = {}): AgentRunRecord {
  return {
    id: randomId("run"),
    agentId: "automation",
    eventId: randomId("evt"),
    tenantId: fixtureTenantId(),
    userId: fixtureUserId(),
    status: "dead_letter",
    attempts: 4,
    inputSummary: "synthetic failed run fixture for agent.failed supervision",
    ...overrides,
  } as AgentRunRecord;
}
