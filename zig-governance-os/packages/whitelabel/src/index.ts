export interface WhiteLabelProfile {
  brandName: string;
  customDomain?: string;
  tenantBranding: boolean;
  marketplaceBranding: boolean;
  learningBranding: boolean;
  customReports: boolean;
}
export class WhiteLabelPlatform {
  readiness(profile: WhiteLabelProfile): number {
    return [profile.customDomain, profile.tenantBranding, profile.marketplaceBranding, profile.learningBranding, profile.customReports].filter(Boolean).length * 20;
  }
}
