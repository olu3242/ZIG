export type PartnerType = "consulting" | "audit" | "implementation" | "technology" | "msp" | "mssp" | "training" | "channel";
export interface PartnerProfile {
  type: PartnerType;
  certified: boolean;
  revenueShareBps: number;
}
export class PartnerCloud {
  score(profile: PartnerProfile): number {
    return Math.min(100, (profile.certified ? 50 : 20) + Math.round(profile.revenueShareBps / 100));
  }
}
