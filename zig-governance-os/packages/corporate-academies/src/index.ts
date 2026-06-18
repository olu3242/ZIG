export type AcademyType = "compliance" | "risk" | "audit" | "security" | "privacy" | "leadership";
export class CorporateAcademyPlatform {
  academyTypes(): AcademyType[] {
    return ["compliance", "risk", "audit", "security", "privacy", "leadership"];
  }
}
