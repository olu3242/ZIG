export type ManagedService = "virtual_ciso" | "virtual_compliance_officer" | "virtual_risk_officer" | "audit_readiness" | "vendor_risk" | "policy_services" | "certification_readiness" | "training_services" | "implementation_services";
export type ServiceLifecycleStage = "request" | "scope" | "engagement" | "deliver" | "review" | "invoice" | "close";
export class ServicesMarketplace {
  lifecycle(service: ManagedService): Array<{ service: ManagedService; stage: ServiceLifecycleStage }> {
    return ["request", "scope", "engagement", "deliver", "review", "invoice", "close"].map((stage) => ({ service, stage: stage as ServiceLifecycleStage }));
  }
}
