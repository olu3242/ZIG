export type RuntimeEntity =
  | "agent_runs" | "agent_decisions" | "agent_tasks" | "agent_approvals" | "workflow_runs" | "workflow_steps" | "workflow_results"
  | "evidence_jobs" | "board_report_jobs" | "compliance_snapshots" | "risk_snapshots" | "digital_twin_snapshots" | "regulatory_signals" | "runtime_events" | "runtime_metrics";
export interface RuntimeRecord {
  tenantId: string;
  entity: RuntimeEntity;
  entityId: string;
  payload: Record<string, unknown>;
  persistedAt: Date;
}
export class RuntimePersistence {
  record(input: Omit<RuntimeRecord, "persistedAt">): RuntimeRecord {
    return { ...input, persistedAt: new Date() };
  }
}
