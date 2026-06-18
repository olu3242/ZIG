export interface CareerReadinessSignal { portfolio: number; projects: number; labs: number; capstones: number; interview: number; skills: number; certifications: number; }
export class CareerReadinessEngine {
  score(signal: CareerReadinessSignal): number {
    return Math.round((signal.portfolio + signal.projects + signal.labs + signal.capstones + signal.interview + signal.skills + signal.certifications) / 7);
  }
}
