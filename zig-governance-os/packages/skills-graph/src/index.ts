export type SkillNodeType = "knowledge" | "skill" | "competency" | "proficiency" | "experience";
export interface SkillNode {
  id: string;
  type: SkillNodeType;
  label: string;
  domain: string;
}
export interface SkillMastery {
  skillId: string;
  proficiency: number;
  experienceHours: number;
}
export class SkillsGraph {
  mastery(mastery: SkillMastery[]): number {
    if (mastery.length === 0) return 0;
    return Math.round(mastery.reduce((sum, item) => sum + item.proficiency, 0) / mastery.length);
  }
  iso27001Core(): SkillNode[] {
    return [
      { id: "iso-27001", type: "knowledge", label: "ISO 27001", domain: "compliance" },
      { id: "risk-assessment", type: "skill", label: "Risk Assessment", domain: "risk" },
      { id: "control-mapping", type: "skill", label: "Control Mapping", domain: "governance" },
      { id: "internal-audit", type: "competency", label: "Internal Audit", domain: "audit" },
      { id: "evidence-management", type: "experience", label: "Evidence Management", domain: "evidence" },
    ];
  }
}
