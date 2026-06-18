export type MarketplaceCategory = "framework_packs" | "control_libraries" | "risk_libraries" | "policy_libraries" | "automation_packs" | "workflow_packs" | "evidence_packs" | "certification_packs" | "industry_packs" | "training_packs";
export interface MarketplaceListing {
  id: string;
  category: MarketplaceCategory;
  name: string;
  version: string;
  monetized: boolean;
  licensed: boolean;
}
export class MarketplaceEngine {
  install(listing: MarketplaceListing, tenantId: string): string {
    return `${tenantId}:${listing.category}:${listing.id}:${listing.version}`;
  }
}
