export type MatchType = "job" | "internship" | "mentor" | "employer";
export class EmployerMatchingEngine {
  match(type: MatchType, readiness: number): string {
    return `${type}:${readiness >= 75 ? "ready" : "developing"}`;
  }
}
