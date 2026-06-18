export type EvidenceSource = "manual_upload" | "automation" | "api_integration" | "cloud_sync" | "import" | "generated";
export type EvidenceHealth = "current" | "expired" | "missing" | "pending_review" | "rejected" | "approved";

export interface EvidenceHealthInput {
  exists: boolean;
  expiresAt?: Date;
  reviewStatus: "none" | "pending" | "rejected" | "approved";
}

export class EvidenceManagementEngine {
  health(input: EvidenceHealthInput, now = new Date()): EvidenceHealth {
    if (!input.exists) return "missing";
    if (input.reviewStatus === "pending") return "pending_review";
    if (input.reviewStatus === "rejected") return "rejected";
    if (input.expiresAt && input.expiresAt.getTime() < now.getTime()) return "expired";
    if (input.reviewStatus === "approved") return "approved";
    return "current";
  }
}
