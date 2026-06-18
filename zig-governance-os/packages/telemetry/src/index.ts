export type TelemetryDomain = "agent" | "workflow" | "queue" | "connector" | "api" | "compliance" | "risk" | "runtime" | "ai";
export class TelemetryCatalog {
  domains(): TelemetryDomain[] {
    return ["agent", "workflow", "queue", "connector", "api", "compliance", "risk", "runtime", "ai"];
  }
}
