export type EmploymentComponent = "resume_builder" | "linkedin_builder" | "portfolio_generator" | "job_matching" | "internship_matching" | "employer_portal" | "mock_interviews" | "career_tracking";
export class EmploymentOS {
  components(): EmploymentComponent[] {
    return ["resume_builder", "linkedin_builder", "portfolio_generator", "job_matching", "internship_matching", "employer_portal", "mock_interviews", "career_tracking"];
  }
}
