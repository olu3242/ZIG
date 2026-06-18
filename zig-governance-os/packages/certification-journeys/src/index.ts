export type CertificationJourney = "iso_lead_implementer" | "iso_lead_auditor" | "soc2_practitioner" | "nist_practitioner" | "vendor_risk_practitioner" | "risk_manager" | "privacy_professional" | "grc_architect";
export class CertificationJourneyEngine {
  journeys(): CertificationJourney[] {
    return ["iso_lead_implementer", "iso_lead_auditor", "soc2_practitioner", "nist_practitioner", "vendor_risk_practitioner", "risk_manager", "privacy_professional", "grc_architect"];
  }
}
