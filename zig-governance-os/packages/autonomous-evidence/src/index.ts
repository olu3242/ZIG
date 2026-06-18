export type AutonomousEvidenceSource = "cloud_providers" | "identity_systems" | "ticketing_systems" | "source_control" | "endpoint_platforms" | "security_platforms" | "document_systems" | "vendor_systems";
export type AutonomousEvidenceHealth = "fresh" | "current" | "expiring" | "expired" | "missing";

export interface EvidenceMaintenanceSignal {
  source: AutonomousEvidenceSource;
  collectedAt?: Date;
  expiresAt?: Date;
  mappedControlIds: string[];
}

export class AutonomousEvidenceEngine {
  health(signal: EvidenceMaintenanceSignal, now = new Date()): AutonomousEvidenceHealth {
    if (!signal.collectedAt) return "missing";
    if (!signal.expiresAt) return "fresh";
    const daysRemaining = Math.ceil((signal.expiresAt.getTime() - now.getTime()) / 86400000);
    if (daysRemaining < 0) return "expired";
    if (daysRemaining <= 14) return "expiring";
    if (daysRemaining <= 45) return "current";
    return "fresh";
  }

  mapToControls(signal: EvidenceMaintenanceSignal): string[] {
    return [...new Set(signal.mappedControlIds)];
  }
}
