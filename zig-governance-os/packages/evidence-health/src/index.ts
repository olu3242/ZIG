// Evidence OS Phase 1 -- Evidence Health resolution + weighted Evidence Health Score.
//
// Per docs/trust-os/evidence-os/EVIDENCE_HEALTH_MODEL.md (Batch 25) and
// docs/trust-os/runtime-convergence/TRUST_OS_DATABASE_ALIGNMENT.md (Contradiction 1):
// this package does NOT invent a third evidence health engine. It is a thin routing/
// adapter layer that calls into the two existing pure-function engines
// (@zig/evidence's EvidenceManagementEngine, @zig/autonomous-evidence's
// AutonomousEvidenceEngine) as input signals, and a separate weighted-score function that
// is layered on top of (not a replacement for) the categorical health gate those engines
// produce.

import { EvidenceManagementEngine, type EvidenceHealth, type EvidenceHealthInput } from "@zig/evidence";
import { AutonomousEvidenceEngine, type AutonomousEvidenceHealth, type EvidenceMaintenanceSignal } from "@zig/autonomous-evidence";

// The canonical persisted vocabulary -- deduplicated union of both engines' value sets,
// matching packages/types EvidenceHealthState and the
// evidence_health_check constraint added in
// supabase/migrations/202606210001_evidence_os_health_vocabulary.sql.
export type ResolvedEvidenceHealth = EvidenceHealth | AutonomousEvidenceHealth;

const managementEngine = new EvidenceManagementEngine();
const autonomousEngine = new AutonomousEvidenceEngine();

// Collection modes that are reviewed by a human and therefore routed through
// EvidenceManagementEngine. Per EVIDENCE_HEALTH_MODEL.md: "manual_upload" or any evidence
// type requiring a review step. Autonomously-collected modes with no review gate route
// through AutonomousEvidenceEngine instead.
const MANUALLY_REVIEWED_SOURCES = new Set(["manual_upload", "generated", "import"]);

export interface EvidenceHealthResolutionInput {
  /** evidence.status's existing source taxonomy: manual_upload | automation | api_integration | cloud_sync | import | generated */
  source: string;
  exists: boolean;
  expiresAt?: Date;
  reviewStatus: "none" | "pending" | "rejected" | "approved";
  collectedAt?: Date;
  mappedControlIds: string[];
}

/**
 * resolveEvidenceHealth -- the adapter documented (not implemented) in
 * TRUST_OS_DATABASE_ALIGNMENT.md, now implemented. Picks which of the two existing
 * engines to call based on the evidence item's source/collection mode, and returns the
 * value that gets persisted into evidence.health. Neither engine's code changes.
 */
export function resolveEvidenceHealth(input: EvidenceHealthResolutionInput, now: Date = new Date()): ResolvedEvidenceHealth {
  if (MANUALLY_REVIEWED_SOURCES.has(input.source)) {
    const engineInput: EvidenceHealthInput = {
      exists: input.exists,
      expiresAt: input.expiresAt,
      reviewStatus: input.reviewStatus,
    };
    return managementEngine.health(engineInput, now);
  }

  const signal: EvidenceMaintenanceSignal = {
    source: autonomousSourceFor(input.source),
    collectedAt: input.collectedAt,
    expiresAt: input.expiresAt,
    mappedControlIds: input.mappedControlIds,
  };
  return autonomousEngine.health(signal, now);
}

// AutonomousEvidenceEngine's source union is a different, narrower taxonomy
// (cloud_providers | identity_systems | ...) than evidence.status's source column
// (automation | api_integration | cloud_sync | ...). This maps the persisted source value
// onto the engine's expected signal source without inventing a third taxonomy -- when the
// persisted source doesn't map cleanly, "security_platforms" is used as a neutral default,
// since the engine's health() does not branch on source at all (only collectedAt/expiresAt
// matter to its computation).
function autonomousSourceFor(source: string): EvidenceMaintenanceSignal["source"] {
  switch (source) {
    case "cloud_sync":
      return "cloud_providers";
    case "api_integration":
      return "identity_systems";
    case "automation":
      return "security_platforms";
    default:
      return "security_platforms";
  }
}

// --- Weighted 0-100 Evidence Health Score -----------------------------------------------
//
// Freshness 30 / Review Status 25 / Usage 15 / Coverage 15 / Mapping 15 = 100, per
// EVIDENCE_HEALTH_MODEL.md. This is the separate, coarser-grained aggregate quality signal
// for dashboard/intelligence purposes (Batch 29) -- it does not gate evidence acceptance;
// the categorical health above does that.

export interface EvidenceHealthScoreInput {
  /** the categorical health already resolved via resolveEvidenceHealth() */
  health: ResolvedEvidenceHealth;
  /** evidence_reviews.status for this evidence item, or undefined if no review row exists */
  reviewStatus?: "pending_review" | "approved" | "rejected";
  /** count of control_evidence rows referencing this evidence item */
  controlEvidenceCount: number;
  /** control_evidence.coverage for the evidence item's primary/strongest mapping, if any */
  coverage?: string;
  /** true if at least one of the evidence's controls resolves to a framework requirement via ControlService.findMappings */
  hasFrameworkMapping: boolean;
}

export interface EvidenceHealthScoreBreakdown {
  freshness: number;
  reviewStatus: number;
  usage: number;
  coverage: number;
  mapping: number;
  total: number;
}

const FRESHNESS_WEIGHT = 0.3;
const REVIEW_STATUS_WEIGHT = 0.25;
const USAGE_WEIGHT = 0.15;
const COVERAGE_WEIGHT = 0.15;
const MAPPING_WEIGHT = 0.15;

// Usage is normalized: more controls supported -> higher, capped at 100. Per
// EVIDENCE_HEALTH_MODEL.md this feeds EVIDENCE_INTELLIGENCE_MODEL.md's reuse signal.
// Five or more controls supported reaches the 100 cap.
const USAGE_SATURATION_COUNT = 5;

function freshnessComponent(health: ResolvedEvidenceHealth): number {
  if (health === "current" || health === "fresh" || health === "approved") return 100;
  if (health === "expiring") return 60;
  // expired | missing | pending_review | rejected
  return 0;
}

function reviewStatusComponent(reviewStatus: EvidenceHealthScoreInput["reviewStatus"]): number {
  if (reviewStatus === "approved") return 100;
  if (reviewStatus === "pending_review") return 40;
  // rejected, or no row at all
  return 0;
}

function usageComponent(controlEvidenceCount: number): number {
  if (controlEvidenceCount <= 0) return 0;
  return Math.min(100, Math.round((controlEvidenceCount / USAGE_SATURATION_COUNT) * 100));
}

function coverageComponent(coverage?: string): number {
  if (coverage === "primary" || coverage === "sufficient") return 100;
  if (coverage === "supporting") return 60;
  return 30;
}

function mappingComponent(hasFrameworkMapping: boolean): number {
  return hasFrameworkMapping ? 100 : 0;
}

/**
 * computeEvidenceHealthScore -- the weighted 0-100 Evidence Health Score formula from
 * EVIDENCE_HEALTH_MODEL.md. Computed per evidence item, read-time, optionally cached onto
 * evidence.health_score by the service layer. Does not replace or gate against the
 * categorical resolveEvidenceHealth() result -- the two are explicitly non-colliding per
 * the docs.
 */
export function computeEvidenceHealthScore(input: EvidenceHealthScoreInput): EvidenceHealthScoreBreakdown {
  const freshness = freshnessComponent(input.health);
  const reviewStatus = reviewStatusComponent(input.reviewStatus);
  const usage = usageComponent(input.controlEvidenceCount);
  const coverage = coverageComponent(input.coverage);
  const mapping = mappingComponent(input.hasFrameworkMapping);

  const total = Math.round(
    freshness * FRESHNESS_WEIGHT +
      reviewStatus * REVIEW_STATUS_WEIGHT +
      usage * USAGE_WEIGHT +
      coverage * COVERAGE_WEIGHT +
      mapping * MAPPING_WEIGHT,
  );

  return { freshness, reviewStatus, usage, coverage, mapping, total };
}
