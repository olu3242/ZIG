import { requirePlatformOwner } from "../../guard";
import { TestTriggerPanel } from "./trigger-panel";

/**
 * Admin test-trigger harness for the 10 canonical DomainEventTypes (see
 * docs/agents/ZIG_AGENT_TRIGGER_MAP.md). Each button calls the runTestTrigger() server
 * action (./actions.ts), which calls emitDomainEvent() from @zig/agent-trigger-automation —
 * the panel never imports or calls an agent handler directly. Every run uses a fresh,
 * in-memory AgentRuntime/AgentGovernanceGuard scoped to that single button click (this is a
 * manual verification harness, not a view onto the production runtime's persisted state),
 * with deterministic fixture inputs (no hardcoded production IDs) supplied automatically by
 * the dispatcher's fixture defaults.
 */
export default async function AgentTestTriggersPage() {
  await requirePlatformOwner();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-zinc-950 px-6 py-10 text-white">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-red-300">Agent SOC / Test Triggers</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Domain Event Trigger Harness</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
          Fires each of the 10 canonical domain events through the trigger-automation dispatcher
          (emitDomainEvent()) using deterministic fixture data. Confirms dispatch resolves the
          correct agent(s), passes governance, executes, and produces a persisted run with a
          decision — without ever calling an agent handler directly. Each run is independent and
          uses a fresh in-memory runtime; it does not reflect or mutate production runtime/audit
          state.
        </p>
      </section>
      <TestTriggerPanel />
    </main>
  );
}
