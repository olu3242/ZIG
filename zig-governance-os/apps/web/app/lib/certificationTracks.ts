import type { CertificationTrackConfig } from "@zig/services";
import type { LearningPath } from "@zig/types";

/**
 * No curriculum-track schema/seed data exists yet (per docs/academy/CERTIFICATION_MODEL.md,
 * thresholds are a product/curriculum-owner decision). Until that catalogue exists, derive
 * one certification track per learning path using the same default thresholds the
 * certification engine's own tests exercise, so the Certification Center is never empty
 * when learning paths exist.
 */
export function trackForLearningPath(path: LearningPath): CertificationTrackConfig {
  return {
    key: `cert_${path.id}`,
    title: path.title,
    learningPathId: path.id,
    knowledgeThreshold: 70,
    skillsThreshold: 70,
    requiresCapstone: true,
    capstoneThreshold: 60,
    badgeKey: `badge_${path.id}`,
  };
}
