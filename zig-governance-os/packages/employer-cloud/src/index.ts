export type EmployerFeature = "talent_search" | "candidate_discovery" | "portfolio_review" | "certification_verification" | "skills_verification" | "job_posting" | "internship_programs";
export class EmployerCloud {
  features(): EmployerFeature[] {
    return ["talent_search", "candidate_discovery", "portfolio_review", "certification_verification", "skills_verification", "job_posting", "internship_programs"];
  }
}
