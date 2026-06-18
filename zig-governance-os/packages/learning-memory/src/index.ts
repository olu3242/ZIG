export type LearningMemoryKind = "question" | "lesson_completed" | "lab_completed" | "assessment_result" | "mentor_session" | "interview_result" | "career_goal" | "certification_goal";
export interface LearningMemory {
  kind: LearningMemoryKind;
  summary: string;
}
export class LearningMemorySystem {
  summarize(memories: LearningMemory[]): string {
    return memories.map((memory) => `${memory.kind}:${memory.summary}`).join(" | ");
  }
}
