import { AgentRuntime, UnsupportedAgentEventError, type AgentRunRequest } from "../index";

function baseRequest(overrides: Partial<AgentRunRequest> = {}): AgentRunRequest {
  return {
    eventId: "evt_1",
    source: "compliance_runtime",
    type: "agent_started",
    context: { tenantId: "tenant_1", userId: "user_1", organizationId: "org_1" },
    goal: "Review evidence for control C-1",
    payload: { evidenceId: "ev_1" },
    agentId: "evidence",
    ...overrides,
  };
}

async function assertEventCreatesRuntimeJob(): Promise<void> {
  const runtime = new AgentRuntime();
  const { run, job } = runtime.submit(baseRequest());
  if (run.status !== "queued" || job.status !== "queued") {
    throw new Error("Expected submit() to create a queued run and a queued job.");
  }
}

async function assertAgentResolvesCorrectly(): Promise<void> {
  const runtime = new AgentRuntime();
  const byId = runtime.resolveAgent(baseRequest({ agentId: "evidence" }));
  if (byId.id !== "evidence") throw new Error("Expected explicit agent id resolution to win.");

  const byCapability = runtime.resolveAgent(baseRequest({ agentId: undefined, capability: "framework_mapping" }));
  if (byCapability.id !== "compliance") throw new Error("Expected capability resolution to find the compliance agent.");

  const byEventType = runtime.resolveAgent(baseRequest({ agentId: undefined, capability: undefined, type: "agent_approved" }));
  if (byEventType.id !== "automation") throw new Error("Expected event-type resolution to find the automation agent.");
}

async function assertSuccessfulExecutionPersistsRecords(): Promise<void> {
  const runtime = new AgentRuntime();
  const { run, job, agent } = runtime.submit(baseRequest());

  const completed = await runtime.execute(run.id, job.id, baseRequest(), agent, async () => ({
    reason: "Evidence is current and mapped.",
    confidence: 0.9,
    dataUsed: ["evidence:ev_1"],
    action: "approve_evidence",
  }));

  if (completed.status !== "succeeded" || completed.confidence !== 0.9) {
    throw new Error("Expected successful execution to mark the run succeeded with a confidence score.");
  }
  if (runtime.listAuditTrail().length < 2) {
    throw new Error("Expected audit records for both submission and decision.");
  }
}

async function assertFailuresPersistProperly(): Promise<void> {
  const runtime = new AgentRuntime();
  const { run, job, agent } = runtime.submit(baseRequest());

  const failed = await runtime.execute(run.id, job.id, baseRequest(), agent, async () => {
    throw new Error("evidence engine unavailable");
  });

  if (failed.status !== "failed" || !failed.errorMessage) {
    throw new Error("Expected a thrown handler error to persist a failed run with an error message.");
  }
}

async function assertRetryIncrementsCount(): Promise<void> {
  const runtime = new AgentRuntime();
  const { run, job, agent } = runtime.submit(baseRequest());

  await runtime.execute(run.id, job.id, baseRequest(), agent, async () => {
    throw new Error("transient failure");
  });

  if (run.attempts !== 1) {
    throw new Error(`Expected attempts to increment to 1, got ${run.attempts}.`);
  }
}

async function assertReplayWorks(): Promise<void> {
  const runtime = new AgentRuntime();
  const { run, job, agent } = runtime.submit(baseRequest());

  await runtime.execute(run.id, job.id, baseRequest(), agent, async () => {
    throw new Error("fails once");
  });

  const replayed = runtime.replay(run.id);
  if (replayed.run.status !== "queued" || replayed.job.status !== "queued") {
    throw new Error("Expected replay() to re-queue the failed run.");
  }
}

async function assertUnsupportedEventsSafelyFail(): Promise<void> {
  const runtime = new AgentRuntime();
  let threw = false;
  try {
    runtime.resolveAgent(
      baseRequest({
        agentId: undefined,
        capability: "capability_that_does_not_exist",
        type: "event_type_no_agent_subscribes_to" as AgentRunRequest["type"],
      }),
    );
  } catch (error) {
    threw = error instanceof UnsupportedAgentEventError;
  }
  if (!threw) {
    throw new Error("Expected resolution to throw UnsupportedAgentEventError for an unsupported event/capability combination.");
  }
}

async function assertTenantContextPreserved(): Promise<void> {
  const runtime = new AgentRuntime();
  const { run } = runtime.submit(baseRequest({ context: { tenantId: "tenant_42", userId: "user_9", organizationId: "org_9" } }));
  if (run.tenantId !== "tenant_42" || run.organizationId !== "org_9" || run.userId !== "user_9") {
    throw new Error("Expected submit() to preserve tenant/org/user context on the run record.");
  }
}

async function run(): Promise<void> {
  await assertEventCreatesRuntimeJob();
  await assertAgentResolvesCorrectly();
  await assertSuccessfulExecutionPersistsRecords();
  await assertFailuresPersistProperly();
  await assertRetryIncrementsCount();
  await assertReplayWorks();
  await assertUnsupportedEventsSafelyFail();
  await assertTenantContextPreserved();
  console.log("[PASS] @zig/agent-runtime tests");
}

void run();
