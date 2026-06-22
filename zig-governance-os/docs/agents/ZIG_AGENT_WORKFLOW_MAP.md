# ZIG Agent Workflow Map — Phase 2D (Evidence Review Agent)

## End-to-end flow

```
evidence.uploaded (domain event, payload metadata)
  -> event ingestion (AgentIngestion.ingest(), inside AgentRuntime.submit())
  -> registry resolution (getAgentById("evidence"))
  -> governance check (AgentGovernanceGuard.evaluate())
  -> runtime execution (AgentRuntime.execute())
  -> existing evidence engine (EvidenceManagementEngine.health())
  -> decision persistence (AgentRunRecord.decision, audit trail)
  -> approval if required (re-evaluate guard with approvalAction: "evidence_rejection")
  -> audit trail (AgentGovernanceGuard.listLog() + AgentRuntime.listAuditTrail())
  -> admin visibility (existing agent-control-tower / agent-soc admin screens, via
     @zig/agent-registry's AgentRegistry.inventory(), unchanged from Phase 2A)
```

Implemented in `reviewEvidence()`, `packages/agent-evidence-review/src/index.ts`.

## Agent definition

The Evidence Review Agent reuses the existing `"evidence"` entry in
`packages/agents/src/index.ts`'s `agentRegistry` — no 13th agent was registered. Its
`AgentDefinition` (canonical, via `getAgentById("evidence")`):

- `id`: `"evidence"`
- `capabilities`: `["evidence_collection", "evidence_classification"]`
- `toolAccess`: `[{ tool: "evidence-engine", scope: "read" }]`
- `permissions`: `["read:evidence", "recommend:evidence"]`
- `eventTypes`: advisory set (`agent_started`/`completed`/`failed`/`escalated`) — it holds no
  `execute:*` permission, consistent with "the agent recommends, it never finalizes."

## Handler responsibilities

`recommend()` in `packages/agent-evidence-review/src/index.ts`:

1. Loads evidence context (`EvidenceReviewInput`: existence, expiry, review status, weak flag).
2. Invokes the existing evidence engine (`EvidenceManagementEngine.health()`, unmodified).
3. Maps health (+ `weak`/`rejected` signal) to one of five `recommend_*`/`request_*` actions.
4. Returns confidence, rationale, evidence/control/framework references, and next steps —
   every output carries the explainability fields the AI Command Center pattern requires
   (reason, data used, confidence, framework reference).

## Admin visibility

Reused, not rebuilt: `AgentRuntime.listAuditTrail()` and `AgentGovernanceGuard.listLog()`
produce the same shapes `RuntimePersistence`/admin screens already expect
(`RuntimeRecord`, decision log entries). No new admin route was created in Phase 2D; wiring
these into `apps/admin/app/admin/agent-control-tower` and `/admin/agent-soc` is a Phase 3+
follow-up once more agents are flowing through the same runtime.

## Validation

- `npx tsx packages/agent-evidence-review/src/tests/evidence-review.test.ts` — 10 assertions,
  `[PASS]`.
