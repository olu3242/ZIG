export type CohortFeature = "live_cohorts" | "bootcamps" | "group_learning" | "assignments" | "peer_reviews" | "study_groups" | "office_hours";
export class CohortEngine {
  features(): CohortFeature[] {
    return ["live_cohorts", "bootcamps", "group_learning", "assignments", "peer_reviews", "study_groups", "office_hours"];
  }
}
