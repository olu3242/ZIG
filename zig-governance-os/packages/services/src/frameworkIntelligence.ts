/**
 * Shared pure-function derivation layer for Framework Intelligence, mirroring the
 * certificationEligibility.ts pattern: no service-to-service composition exists in this
 * codebase, so logic shared across FrameworkCoverageService / FrameworkGapService /
 * FrameworkRoadmapService / EvidenceReuseService / CoachService lives here as plain
 * functions over already-fetched repository rows. Coverage/gaps/roadmaps/evidence-reuse
 * are computed at read time from the existing framework_controls/framework_mappings/
 * controls/control_evidence/evidence_reviews tables — no new persisted tables.
 */

export interface FrameworkControlInput {
  id: string;
  controlCode: string;
  domainId?: string;
  title: string;
}

export interface ProjectControlInput {
  id: string;
  controlId: string;
  frameworkId: string;
  status: string;
}

export interface ControlEvidenceLinkInput {
  controlId: string;
  evidenceId: string;
}

export interface EvidenceReviewInput {
  evidenceId: string;
  status: string;
}

export type FrameworkRequirementStatus = "implemented" | "partial" | "missing";

export interface FrameworkControlCoverage {
  frameworkControlId: string;
  controlCode: string;
  title: string;
  status: FrameworkRequirementStatus;
  matchedControlId?: string;
  hasApprovedEvidence: boolean;
}

export interface FrameworkCoverageBreakdown {
  totalControlCount: number;
  implementedControlCount: number;
  partialControlCount: number;
  missingControlCount: number;
  coveragePercent: number;
  healthScore: number;
  controls: FrameworkControlCoverage[];
}

/**
 * A framework_controls row counts as "implemented" when the project has a matching
 * Control (matched by control_code, the same join key ControlMapping/GovernanceService
 * already use implicitly via Control.controlId) that is "implemented" AND has at least
 * one approved evidence link; "partial" when a matching control exists but is not fully
 * backed by approved evidence; "missing" when no matching control exists at all.
 */
export function computeFrameworkCoverage(
  frameworkControls: FrameworkControlInput[],
  projectControls: ProjectControlInput[],
  controlEvidenceLinks: ControlEvidenceLinkInput[],
  evidenceReviews: EvidenceReviewInput[],
): FrameworkCoverageBreakdown {
  const approvedEvidenceIds = new Set(evidenceReviews.filter((review) => review.status === "approved").map((review) => review.evidenceId));
  const controlsByCode = new Map(projectControls.map((control) => [control.controlId, control]));

  const controls: FrameworkControlCoverage[] = frameworkControls.map((frameworkControl) => {
    const matched = controlsByCode.get(frameworkControl.controlCode);
    if (!matched) {
      return { frameworkControlId: frameworkControl.id, controlCode: frameworkControl.controlCode, title: frameworkControl.title, status: "missing", hasApprovedEvidence: false };
    }

    const hasApprovedEvidence = controlEvidenceLinks.some((link) => link.controlId === matched.id && approvedEvidenceIds.has(link.evidenceId));
    const status: FrameworkRequirementStatus = matched.status === "implemented" && hasApprovedEvidence ? "implemented" : "partial";
    return { frameworkControlId: frameworkControl.id, controlCode: frameworkControl.controlCode, title: frameworkControl.title, status, matchedControlId: matched.id, hasApprovedEvidence };
  });

  const totalControlCount = controls.length;
  const implementedControlCount = controls.filter((control) => control.status === "implemented").length;
  const partialControlCount = controls.filter((control) => control.status === "partial").length;
  const missingControlCount = controls.filter((control) => control.status === "missing").length;
  const coveragePercent = totalControlCount === 0 ? 0 : Math.round((implementedControlCount / totalControlCount) * 100);
  const healthScore = totalControlCount === 0 ? 0 : Math.round(((implementedControlCount + 0.5 * partialControlCount) / totalControlCount) * 100);

  return { totalControlCount, implementedControlCount, partialControlCount, missingControlCount, coveragePercent, healthScore, controls };
}

export type GapKind = "missing_control" | "missing_evidence" | "unreviewed_evidence";

export interface FrameworkGap {
  frameworkControlId: string;
  controlCode: string;
  title: string;
  kind: GapKind;
  severity: "high" | "medium" | "low";
  recommendation: string;
}

export function computeFrameworkGaps(coverage: FrameworkCoverageBreakdown): FrameworkGap[] {
  return coverage.controls
    .filter((control) => control.status !== "implemented")
    .map((control) => {
      if (control.status === "missing") {
        return {
          frameworkControlId: control.frameworkControlId,
          controlCode: control.controlCode,
          title: control.title,
          kind: "missing_control" as const,
          severity: "high" as const,
          recommendation: `Create and implement a control mapped to "${control.controlCode} — ${control.title}".`,
        };
      }
      return {
        frameworkControlId: control.frameworkControlId,
        controlCode: control.controlCode,
        title: control.title,
        kind: control.hasApprovedEvidence ? ("missing_control" as const) : ("missing_evidence" as const),
        severity: "medium" as const,
        recommendation: control.hasApprovedEvidence
          ? `Mark the control mapped to "${control.controlCode}" as implemented — evidence is already approved.`
          : `Upload and get evidence approved for the control mapped to "${control.controlCode} — ${control.title}".`,
      };
    });
}

export interface FrameworkMappingInput {
  sourceFrameworkControlId: string;
  targetFrameworkControlId: string;
  mappingStrength: string;
  rationale: string;
}

export interface CrosswalkRow {
  targetFrameworkControlId: string;
  targetControlCode: string;
  targetTitle: string;
  mappingStrength: string;
  rationale: string;
}

export function computeCrosswalk(
  sourceFrameworkControlId: string,
  mappings: FrameworkMappingInput[],
  targetFrameworkControls: FrameworkControlInput[],
): CrosswalkRow[] {
  const targetById = new Map(targetFrameworkControls.map((control) => [control.id, control]));
  return mappings
    .filter((mapping) => mapping.sourceFrameworkControlId === sourceFrameworkControlId)
    .map((mapping) => {
      const target = targetById.get(mapping.targetFrameworkControlId);
      return {
        targetFrameworkControlId: mapping.targetFrameworkControlId,
        targetControlCode: target?.controlCode ?? mapping.targetFrameworkControlId,
        targetTitle: target?.title ?? "Unknown control",
        mappingStrength: mapping.mappingStrength,
        rationale: mapping.rationale,
      };
    });
}

export interface RoadmapMilestone {
  domainId?: string;
  controlCode: string;
  title: string;
  estimatedEffortHours: number;
  alreadyCoveredViaMapping: boolean;
}

export interface FrameworkRoadmap {
  targetControlCount: number;
  alreadyCoveredCount: number;
  remainingControlCount: number;
  estimatedTotalEffortHours: number;
  milestones: RoadmapMilestone[];
}

/**
 * "Already covered via mapping" = the target framework's control is reachable from a
 * project control already implemented in the current framework via framework_mappings —
 * the same crosswalk data EvidenceReuseService/computeCrosswalk uses, applied in reverse.
 */
export function computeRoadmap(
  targetFrameworkControls: FrameworkControlInput[],
  currentCoverage: FrameworkCoverageBreakdown,
  mappings: FrameworkMappingInput[],
): FrameworkRoadmap {
  const implementedSourceIds = new Set(currentCoverage.controls.filter((control) => control.status === "implemented").map((control) => control.frameworkControlId));
  const reachableTargetIds = new Set(mappings.filter((mapping) => implementedSourceIds.has(mapping.sourceFrameworkControlId)).map((mapping) => mapping.targetFrameworkControlId));

  const milestones: RoadmapMilestone[] = targetFrameworkControls.map((control) => ({
    domainId: control.domainId,
    controlCode: control.controlCode,
    title: control.title,
    estimatedEffortHours: reachableTargetIds.has(control.id) ? 1 : 6,
    alreadyCoveredViaMapping: reachableTargetIds.has(control.id),
  }));

  const alreadyCoveredCount = milestones.filter((milestone) => milestone.alreadyCoveredViaMapping).length;

  return {
    targetControlCount: targetFrameworkControls.length,
    alreadyCoveredCount,
    remainingControlCount: targetFrameworkControls.length - alreadyCoveredCount,
    estimatedTotalEffortHours: milestones.reduce((total, milestone) => total + milestone.estimatedEffortHours, 0),
    milestones,
  };
}

export interface EvidenceReuseRow {
  evidenceId: string;
  sourceControlId: string;
  sourceFrameworkControlId?: string;
  reusableFrameworkControlIds: string[];
  reuseCount: number;
}

/**
 * One piece of evidence "reuses" across frameworks when its linked project control maps
 * (by control_code) to a framework_controls row that has outgoing framework_mappings rows —
 * each mapped target is a framework the same evidence could satisfy without re-collection.
 */
export function computeEvidenceReuse(
  controlEvidenceLinks: ControlEvidenceLinkInput[],
  projectControls: ProjectControlInput[],
  frameworkControls: FrameworkControlInput[],
  mappings: FrameworkMappingInput[],
): EvidenceReuseRow[] {
  const controlsById = new Map(projectControls.map((control) => [control.id, control]));
  const frameworkControlByCode = new Map(frameworkControls.map((control) => [control.controlCode, control]));

  return controlEvidenceLinks.map((link) => {
    const sourceControl = controlsById.get(link.controlId);
    const sourceFrameworkControl = sourceControl ? frameworkControlByCode.get(sourceControl.controlId) : undefined;
    const reusableFrameworkControlIds = sourceFrameworkControl
      ? mappings.filter((mapping) => mapping.sourceFrameworkControlId === sourceFrameworkControl.id).map((mapping) => mapping.targetFrameworkControlId)
      : [];

    return {
      evidenceId: link.evidenceId,
      sourceControlId: link.controlId,
      sourceFrameworkControlId: sourceFrameworkControl?.id,
      reusableFrameworkControlIds,
      reuseCount: reusableFrameworkControlIds.length,
    };
  });
}
