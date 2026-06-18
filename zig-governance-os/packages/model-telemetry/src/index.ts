export type ModelProvider = "openai" | "anthropic" | "azure_openai" | "google" | "local";
export interface ModelTelemetryRecord {
  provider: ModelProvider;
  modelVersion: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  failures: number;
  retries: number;
  cost: number;
}
export class ModelTelemetry {
  totalTokens(record: ModelTelemetryRecord): number {
    return record.promptTokens + record.completionTokens;
  }
  reliability(record: ModelTelemetryRecord): number {
    return Math.max(0, Math.round(100 - record.failures * 15 - record.retries * 5));
  }
}
