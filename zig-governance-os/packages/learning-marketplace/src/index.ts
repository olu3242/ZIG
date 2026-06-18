export type LearningAssetType = "course" | "lab" | "scenario" | "playbook" | "template" | "assessment" | "certification_pack";
export interface LearningAsset {
  id: string;
  type: LearningAssetType;
  title: string;
  level: "foundation" | "practitioner" | "advanced";
}
export class LearningMarketplace {
  catalog(): LearningAsset[] {
    return [
      { id: "iso-foundations", type: "course", title: "ISO 27001 Foundations", level: "foundation" },
      { id: "audit-lab", type: "lab", title: "Internal Audit Practice Lab", level: "practitioner" },
      { id: "capstone-pack", type: "certification_pack", title: "Certification Capstone Pack", level: "advanced" },
    ];
  }
}
