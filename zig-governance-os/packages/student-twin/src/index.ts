export type StudentTwinComponent = "knowledge" | "skills" | "competency" | "portfolio" | "certification" | "career" | "behavior" | "confidence" | "learning";
export interface StudentTwinState {
  learnerId: string;
  scores: Record<StudentTwinComponent, number>;
}
export class StudentDigitalTwin {
  components(): StudentTwinComponent[] {
    return ["knowledge", "skills", "competency", "portfolio", "certification", "career", "behavior", "confidence", "learning"];
  }
  health(state: StudentTwinState): number {
    const values = Object.values(state.scores);
    return values.length === 0 ? 0 : Math.round(values.reduce((sum, score) => sum + score, 0) / values.length);
  }
}
