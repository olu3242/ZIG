import { AgentIngestion, type AgentEventEnvelope, type AgentEventSource, type AgentEventType } from "@zig/agent-ingestion";
import { RuntimeQueue, type RuntimeQueueJob } from "@zig/runtime-queue";
import { RuntimePersistence, type RuntimeRecord } from "@zig/runtime-persistence";
import {
  getAgentById,
  getAgentsByCapability,
  getAgentsByEventType,
  type AgentContext,
  type AgentDecision,
  type AgentDefinition,
  type AgentId,
} from "@zig/agents";

/**
 * Canonical Phase 2B runtime flow, built only on existing pieces:
 * Event (agent-ingestion) -> Agent Registry (agents) -> Runtime Queue (runtime-queue)
 * -> Worker (this package's execute()) -> Runtime Persistence (runtime-persistence) -> Audit Records.
 * No parallel runtime, no new tables: agent_runs/agent_decisions/agent_tasks/agent_approvals
 * already exist (supabase/migrations/202606180006_production_convergence.sql); this package
 * shapes the in-process records that mirror them, the same way @zig/runtime-persistence already
 * models RuntimeRecord without owning a database connection.
 */

export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed" | "dead_letter";

export interface AgentRunRecord {
  id: string;
  agentId: AgentId;
  eventId: string;
  tenantId: string;
  organizationId?: string;
  userId: string;
  status: AgentRunStatus;
  attempts: number;
  startedAt?: Date;
  completedAt?: Date;
  inputSummary: string;
  outputSummary?: string;
  confidence?: number;
  decision?: AgentDecision;
  errorMessage?: string;
}

export interface AgentRunRequest {
  eventId: string;
  source: AgentEventSource;
  type: AgentEventType;
  context: AgentContext;
  goal: string;
  payload: Record<string, unknown>;
  /** Resolve by explicit agent id; if omitted, resolution falls back to capability then event type. */
  agentId?: AgentId;
  capability?: string;
}

export type AgentHandler = (
  input: AgentRunRequest,
  agent: AgentDefinition,
) => Promise<Omit<AgentDecision, "agentId" | "context">>;

export class UnsupportedAgentEventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedAgentEventError";
  }
}

export class AgentRuntime {
  private readonly ingestion = new AgentIngestion();
  private readonly queue = new RuntimeQueue();
  private readonly persistence = new RuntimePersistence();
  private readonly runs = new Map<string, AgentRunRecord>();
  private readonly jobs = new Map<string, RuntimeQueueJob>();
  private readonly auditTrail: RuntimeRecord[] = [];
  private nextId = 0;

  /** Resolution order: explicit agent id, then capability, then event type — first match wins. */
  resolveAgent(request: AgentRunRequest): AgentDefinition {
    if (request.agentId) {
      const byId = getAgentById(request.agentId);
      if (!byId) {
        throw new UnsupportedAgentEventError(`No agent registered with id "${request.agentId}".`);
      }
      return byId;
    }

    if (request.capability) {
      const byCapability = getAgentsByCapability(request.capability);
      if (byCapability.length > 0) {
        return byCapability[0];
      }
    }

    const byEventType = getAgentsByEventType(request.type);
    if (byEventType.length === 0) {
      throw new UnsupportedAgentEventError(`No agent subscribes to event type "${request.type}".`);
    }
    return byEventType[0];
  }

  /** Event -> Agent Registry -> Runtime Queue. Creates the queued run + job, does not execute. */
  submit(request: AgentRunRequest): { run: AgentRunRecord; job: RuntimeQueueJob; agent: AgentDefinition } {
    const agent = this.resolveAgent(request);
    const event: AgentEventEnvelope = this.ingestion.ingest({
      tenantId: request.context.tenantId,
      agentId: agent.id,
      source: request.source,
      type: request.type,
      payload: request.payload,
    });

    const id = this.allocateId("run");
    const job = this.queue.enqueue({
      id: this.allocateId("job"),
      tenantId: request.context.tenantId,
      type: "agent",
      priority: 50,
      maxAttempts: 3,
      scheduledAt: event.occurredAt,
    });

    const run: AgentRunRecord = {
      id,
      agentId: agent.id,
      eventId: request.eventId,
      tenantId: request.context.tenantId,
      organizationId: request.context.organizationId,
      userId: request.context.userId,
      status: "queued",
      attempts: 0,
      inputSummary: request.goal,
    };

    this.runs.set(id, run);
    this.jobs.set(job.id, job);
    this.recordAudit(run, "agent_runs");

    return { run, job, agent };
  }

  /** Worker -> Runtime Persistence -> Audit Records. Executes a previously submitted run. */
  async execute(
    runId: string,
    jobId: string,
    request: AgentRunRequest,
    agent: AgentDefinition,
    handler: AgentHandler,
  ): Promise<AgentRunRecord> {
    const run = this.requireRun(runId);
    const job = this.requireJob(jobId);

    run.status = "running";
    run.startedAt = new Date();

    try {
      const partial = await handler(request, agent);
      const decision: AgentDecision = { ...partial, agentId: agent.id, context: request.context };

      run.status = "succeeded";
      run.completedAt = new Date();
      run.decision = decision;
      run.outputSummary = decision.action;
      run.confidence = decision.confidence;

      this.recordAudit(run, "agent_decisions");
      return run;
    } catch (error) {
      run.attempts += 1;
      run.errorMessage = error instanceof Error ? error.message : String(error);

      const advanced = this.queue.nextAttempt({ ...job, attempts: run.attempts - 1 });
      this.jobs.set(job.id, advanced);
      run.status = advanced.status === "dead_letter" ? "dead_letter" : "failed";

      this.recordAudit(run, "agent_runs");
      return run;
    }
  }

  /** Re-queues a failed/dead-lettered run for another attempt, preserving tenant + agent context. */
  replay(runId: string): { run: AgentRunRecord; job: RuntimeQueueJob } {
    const run = this.requireRun(runId);
    if (run.status !== "failed" && run.status !== "dead_letter") {
      throw new Error(`Run "${runId}" is not eligible for replay (status: ${run.status}).`);
    }

    const job = this.queue.enqueue({
      id: this.allocateId("job"),
      tenantId: run.tenantId,
      type: "agent",
      priority: 50,
      maxAttempts: 3,
      scheduledAt: new Date(),
    });

    run.status = "queued";
    run.errorMessage = undefined;
    this.jobs.set(job.id, job);
    this.recordAudit(run, "agent_runs");

    return { run, job };
  }

  getRun(runId: string): AgentRunRecord | undefined {
    return this.runs.get(runId);
  }

  getJob(jobId: string): RuntimeQueueJob | undefined {
    return this.jobs.get(jobId);
  }

  listAuditTrail(): RuntimeRecord[] {
    return [...this.auditTrail];
  }

  private requireRun(runId: string): AgentRunRecord {
    const run = this.runs.get(runId);
    if (!run) throw new Error(`Unknown run "${runId}".`);
    return run;
  }

  private requireJob(jobId: string): RuntimeQueueJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Unknown job "${jobId}".`);
    return job;
  }

  private recordAudit(run: AgentRunRecord, entity: "agent_runs" | "agent_decisions"): void {
    this.auditTrail.push(
      this.persistence.record({
        tenantId: run.tenantId,
        entity,
        entityId: run.id,
        payload: { ...run },
      }),
    );
  }

  private allocateId(prefix: string): string {
    this.nextId += 1;
    return `${prefix}_${this.nextId}`;
  }
}
