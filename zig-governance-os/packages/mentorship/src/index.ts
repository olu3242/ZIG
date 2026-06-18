export type MentorshipFeature = "mentor_matching" | "career_coaching" | "portfolio_reviews" | "mock_interviews" | "project_reviews" | "certification_coaching";
export class MentorshipPlatform {
  features(): MentorshipFeature[] {
    return ["mentor_matching", "career_coaching", "portfolio_reviews", "mock_interviews", "project_reviews", "certification_coaching"];
  }
}
