export type RuntimeQueueType = "agent" | "workflow" | "evidence" | "compliance" | "risk" | "board_report" | "regulatory" | "connector_sync";
export type RuntimeQueueStatus = "queued" | "running" | "succeeded" | "failed" | "dead_letter";
export interface RuntimeQueueJob {
  id: string;
  tenantId: string;
  type: RuntimeQueueType;
  priority: number;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  status: RuntimeQueueStatus;
}
export class RuntimeQueue {
  enqueue(job: Omit<RuntimeQueueJob, "attempts" | "status">): RuntimeQueueJob {
    return { ...job, attempts: 0, status: "queued" };
  }
  nextAttempt(job: RuntimeQueueJob): RuntimeQueueJob {
    const attempts = job.attempts + 1;
    return { ...job, attempts, status: attempts >= job.maxAttempts ? "dead_letter" : "queued" };
  }
  backoffMs(job: RuntimeQueueJob): number {
    return Math.min(60000, 1000 * 2 ** job.attempts);
  }
}
