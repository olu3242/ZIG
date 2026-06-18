export type CredentialType = "certificate" | "badge" | "micro_credential" | "skill_verification" | "portfolio_verification" | "experience_verification";
export class CredentialingPlatform {
  credentialTypes(): CredentialType[] {
    return ["certificate", "badge", "micro_credential", "skill_verification", "portfolio_verification", "experience_verification"];
  }
}
