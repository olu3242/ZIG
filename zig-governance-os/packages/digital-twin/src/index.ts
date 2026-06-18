export type TwinComponent = "governance" | "risk" | "compliance" | "audit" | "vendor" | "policy" | "certification";
export type ForecastHorizon = "90_day" | "180_day" | "365_day";

export interface TwinState {
  component: TwinComponent;
  currentScore: number;
  targetScore: number;
}

export class ExecutiveDigitalTwin {
  gap(state: TwinState): number {
    return Math.max(0, state.targetScore - state.currentScore);
  }

  forecast(state: TwinState, horizon: ForecastHorizon): number {
    const uplift = horizon === "90_day" ? 8 : horizon === "180_day" ? 15 : 24;
    return Math.min(100, Math.round(state.currentScore + uplift));
  }
}
