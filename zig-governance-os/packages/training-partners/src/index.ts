export type TrainingPartnerType = "universities" | "training_providers" | "consultants" | "audit_firms" | "professional_associations" | "corporate_academies";
export class TrainingPartnerNetwork {
  types(): TrainingPartnerType[] {
    return ["universities", "training_providers", "consultants", "audit_firms", "professional_associations", "corporate_academies"];
  }
}
