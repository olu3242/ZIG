export type CommunityProgram = "cohort" | "bootcamp" | "live_class" | "office_hours" | "assignment" | "group_project" | "mentorship" | "peer_review";
export class CommunityOS {
  programPlan(): CommunityProgram[] {
    return ["cohort", "bootcamp", "live_class", "office_hours", "assignment", "group_project", "mentorship", "peer_review"];
  }
  mentorMatchScore(skillOverlap: number, availabilityOverlap: number): number {
    return Math.round((skillOverlap * 0.7 + availabilityOverlap * 0.3) * 100);
  }
}
