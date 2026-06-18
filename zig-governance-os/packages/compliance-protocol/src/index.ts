export interface ComplianceProtocolEnvelope {
  tenantIsolation: true;
  aggregated: boolean;
  anonymized: boolean;
  zeroDataLeakage: true;
  zeroTrustDesign: true;
}
export class ComplianceProtocol {
  publishable(envelope: ComplianceProtocolEnvelope): boolean {
    return envelope.tenantIsolation && envelope.aggregated && envelope.anonymized && envelope.zeroDataLeakage && envelope.zeroTrustDesign;
  }
}
