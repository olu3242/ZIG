export type TrainingAsset = "courses" | "labs" | "scenarios" | "playbooks" | "templates" | "assessments" | "certifications" | "mentorship_programs";
export type TrainingMonetization = "subscriptions" | "course_purchases" | "certification_fees" | "mentorship_fees" | "enterprise_licensing";
export class TrainingMarketplace {
  assets(): TrainingAsset[] {
    return ["courses", "labs", "scenarios", "playbooks", "templates", "assessments", "certifications", "mentorship_programs"];
  }
}
