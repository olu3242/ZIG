export type MentorshipRole = "mentor" | "coach" | "reviewer" | "industry_expert" | "employer";
export class MentorshipCloud {
  roles(): MentorshipRole[] {
    return ["mentor", "coach", "reviewer", "industry_expert", "employer"];
  }
}
