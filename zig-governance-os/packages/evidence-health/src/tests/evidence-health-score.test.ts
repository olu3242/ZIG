import { computeEvidenceHealthScore, resolveEvidenceHealth } from "../index";

async function assertCurrentManualEvidenceResolvesToManagementEngineApproved(): Promise<void> {
  const health = resolveEvidenceHealth({
    source: "manual_upload",
    exists: true,
    reviewStatus: "approved",
    mappedControlIds: [],
  });

  if (health !== "approved") {
    throw new Error(`Expected manual_upload + approved review to resolve to 'approved', got '${health}'.`);
  }
}

async function assertMissingManualEvidenceResolvesToMissing(): Promise<void> {
  const health = resolveEvidenceHealth({
    source: "manual_upload",
    exists: false,
    reviewStatus: "none",
    mappedControlIds: [],
  });

  if (health !== "missing") {
    throw new Error(`Expected non-existent manual evidence to resolve to 'missing', got '${health}'.`);
  }
}

async function assertCloudSyncEvidenceRoutesToAutonomousEngine(): Promise<void> {
  const now = new Date("2026-06-26T00:00:00Z");
  const health = resolveEvidenceHealth(
    {
      source: "cloud_sync",
      exists: true,
      reviewStatus: "none",
      collectedAt: new Date("2026-06-20T00:00:00Z"),
      expiresAt: new Date("2026-08-01T00:00:00Z"),
      mappedControlIds: ["ctrl_1"],
    },
    now,
  );

  // collected 6 days ago, expires in ~36 days -> AutonomousEvidenceEngine's "current" band (<=45 days)
  if (health !== "current") {
    throw new Error(`Expected cloud_sync evidence within the 45-day freshness window to resolve to 'current', got '${health}'.`);
  }
}

async function assertCloudSyncEvidenceWithoutCollectionResolvesToMissing(): Promise<void> {
  const health = resolveEvidenceHealth({
    source: "cloud_sync",
    exists: true,
    reviewStatus: "none",
    mappedControlIds: [],
  });

  if (health !== "missing") {
    throw new Error(`Expected uncollected autonomous evidence to resolve to 'missing', got '${health}'.`);
  }
}

async function assertFullScoreIsOneHundredWhenEveryComponentIsMaxed(): Promise<void> {
  const breakdown = computeEvidenceHealthScore({
    health: "current",
    reviewStatus: "approved",
    controlEvidenceCount: 5,
    coverage: "primary",
    hasFrameworkMapping: true,
  });

  if (breakdown.total !== 100) {
    throw new Error(`Expected a fully-maxed evidence item to score 100, got ${breakdown.total}.`);
  }
}

async function assertZeroScoreWhenEvidenceIsMissingAndUnreviewedAndUnmapped(): Promise<void> {
  const breakdown = computeEvidenceHealthScore({
    health: "missing",
    reviewStatus: undefined,
    controlEvidenceCount: 0,
    coverage: undefined,
    hasFrameworkMapping: false,
  });

  // Coverage component floors at 30 (the "other/unset" band) per EVIDENCE_HEALTH_MODEL.md,
  // weighted at 15% -> 30 * 0.15 = 4.5, rounds to 5.
  if (breakdown.total !== 5) {
    throw new Error(`Expected a fully-missing evidence item to score 5 (coverage floor only), got ${breakdown.total}.`);
  }
}

async function assertWeightsSumToOneHundredAtMaximum(): Promise<void> {
  const breakdown = computeEvidenceHealthScore({
    health: "fresh",
    reviewStatus: "approved",
    controlEvidenceCount: 10,
    coverage: "sufficient",
    hasFrameworkMapping: true,
  });

  const expected = 0.3 * 100 + 0.25 * 100 + 0.15 * 100 + 0.15 * 100 + 0.15 * 100;
  if (breakdown.total !== Math.round(expected)) {
    throw new Error(`Expected weighted total ${Math.round(expected)}, got ${breakdown.total}.`);
  }
}

async function assertUsageComponentSaturatesAtFiveControls(): Promise<void> {
  const fiveControls = computeEvidenceHealthScore({
    health: "missing",
    controlEvidenceCount: 5,
    hasFrameworkMapping: false,
  });
  const tenControls = computeEvidenceHealthScore({
    health: "missing",
    controlEvidenceCount: 10,
    hasFrameworkMapping: false,
  });

  if (fiveControls.usage !== 100 || tenControls.usage !== 100) {
    throw new Error("Expected usage component to saturate (cap at 100) once 5+ controls are supported.");
  }
}

async function assertPendingReviewScoresFortyOnReviewComponent(): Promise<void> {
  const breakdown = computeEvidenceHealthScore({
    health: "pending_review",
    reviewStatus: "pending_review",
    controlEvidenceCount: 0,
    hasFrameworkMapping: false,
  });

  if (breakdown.reviewStatus !== 40) {
    throw new Error(`Expected pending_review to score 40 on the review component, got ${breakdown.reviewStatus}.`);
  }
}

void assertCurrentManualEvidenceResolvesToManagementEngineApproved();
void assertMissingManualEvidenceResolvesToMissing();
void assertCloudSyncEvidenceRoutesToAutonomousEngine();
void assertCloudSyncEvidenceWithoutCollectionResolvesToMissing();
void assertFullScoreIsOneHundredWhenEveryComponentIsMaxed();
void assertZeroScoreWhenEvidenceIsMissingAndUnreviewedAndUnmapped();
void assertWeightsSumToOneHundredAtMaximum();
void assertUsageComponentSaturatesAtFiveControls();
void assertPendingReviewScoresFortyOnReviewComponent();
