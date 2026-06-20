/**
 * Pure-function eligibility derivation per docs/academy/CERTIFICATION_MODEL.md Section 2.
 * Not a service — a shared computation, the same role @zig/progress-engine and
 * @zig/completion-engine play for LearningService/ScenarioService. Each of
 * CertificationEligibilityService/CertificationProgressService/CertificationAwardService
 * fetches its own data via repositories (no service-to-service injection, per the
 * established factory.ts pattern) and calls this function to compute the breakdown, so the
 * derivation logic itself is written exactly once.
 */

export interface CertificationTrackConfig {
  key: string;
  title: string;
  learningPathId: string;
  knowledgeThreshold: number;
  skillsThreshold: number;
  requiresCapstone: boolean;
  capstoneThreshold: number;
  badgeKey: string;
}

export interface CertificationEligibilityInput {
  totalModuleCount: number;
  completedLessonCount: number;
  knowledgeScore: number;
  skillsScore: number;
  hasGradedCapstone: boolean;
  capstoneScore: number;
  track: CertificationTrackConfig;
}

export type CertificationStatus = "eligible" | "in_progress" | "missing_requirements";

export interface CertificationEligibilityBreakdown {
  knowledgeRequirementMet: boolean;
  skillsRequirementMet: boolean;
  completionRequirementMet: boolean;
  capstoneRequirementMet: boolean;
  completionPercent: number;
  eligible: boolean;
  status: CertificationStatus;
  missingRequirements: string[];
  summaryScore: number;
}

export function computeEligibilityBreakdown(input: CertificationEligibilityInput): CertificationEligibilityBreakdown {
  const { totalModuleCount, completedLessonCount, knowledgeScore, skillsScore, hasGradedCapstone, capstoneScore, track } = input;

  const completionPercent = totalModuleCount === 0 ? 0 : Math.round((completedLessonCount / totalModuleCount) * 100);

  const knowledgeRequirementMet = knowledgeScore >= track.knowledgeThreshold;
  const skillsRequirementMet = skillsScore >= track.skillsThreshold;
  const completionRequirementMet = totalModuleCount > 0 && completedLessonCount >= totalModuleCount;
  const capstoneRequirementMet = !track.requiresCapstone || (hasGradedCapstone && capstoneScore >= track.capstoneThreshold);

  const missingRequirements: string[] = [];
  if (!knowledgeRequirementMet) {
    missingRequirements.push(`Knowledge score ${knowledgeScore}% is below the required ${track.knowledgeThreshold}%.`);
  }
  if (!skillsRequirementMet) {
    missingRequirements.push(`Skills score ${skillsScore}% is below the required ${track.skillsThreshold}%.`);
  }
  if (!completionRequirementMet) {
    missingRequirements.push(`${completedLessonCount} of ${totalModuleCount} required lessons completed (${completionPercent}%).`);
  }
  if (!capstoneRequirementMet) {
    missingRequirements.push(
      hasGradedCapstone
        ? `Capstone score ${capstoneScore}% is below the required ${track.capstoneThreshold}%.`
        : "A graded capstone project is required and has not been submitted.",
    );
  }

  const eligible = knowledgeRequirementMet && skillsRequirementMet && completionRequirementMet && capstoneRequirementMet;
  const status: CertificationStatus = eligible ? "eligible" : missingRequirements.length >= 3 ? "missing_requirements" : "in_progress";

  const componentPercentages = [
    Math.min(100, knowledgeScore),
    Math.min(100, skillsScore),
    completionPercent,
    track.requiresCapstone ? Math.min(100, capstoneScore) : 100,
  ];
  const summaryScore = Math.round(componentPercentages.reduce((sum, value) => sum + value, 0) / componentPercentages.length);

  return {
    knowledgeRequirementMet,
    skillsRequirementMet,
    completionRequirementMet,
    capstoneRequirementMet,
    completionPercent,
    eligible,
    status,
    missingRequirements,
    summaryScore,
  };
}
