export type TrainingCloudScope = "multi_tenant" | "department" | "business_unit" | "regional" | "partner" | "customer";
export class TrainingCloud {
  scopes(): TrainingCloudScope[] {
    return ["multi_tenant", "department", "business_unit", "regional", "partner", "customer"];
  }
}
