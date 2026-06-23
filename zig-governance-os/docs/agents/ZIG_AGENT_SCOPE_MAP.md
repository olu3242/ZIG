# ZIG Agent OS — Scope Map

> Companion to `ZIG_AGENT_GAP_REPORT.md`. This document fixes the boundary of what the
> Agent OS is allowed to be in ZIG, and which existing package each future piece must
> build on rather than duplicate. Anything not listed here is out of scope per the
> mission ("ZIG is not a generic agent platform").

## In-scope agent domains (and only these)

| # | Agent | ZIG capability area | Status from audit |
|---|---|---|---|
| 1 | Onboarding Agent | Persona/role/journey setup | MISSING (logic) — `apps/web/app/lib/actions.ts` `onboardingAction` is the only existing onboarding code, and it's a plain form handler, not agent-driven |
| 2 | Learning Path Agent | GRC Learning | PARTIAL — `learning-os`, `learning-kernel`, `learning-analytics` exist as scoring shells; no path-generation logic |
| 3 | Framework Mapping Agent | Framework Mapping | PARTIAL — `packages/frameworks` registry + `framework-engine` registry (duplicate, must reconcile) |
| 4 | Risk Assessment Agent | Risk Assessment | EXISTS (engine) — `packages/risks` scoring is real; agent wraps it, doesn't replace it |
| 5 | Control Advisor Agent | Controls | EXISTS (engine) — `packages/controls` scoring is real; agent wraps it |
| 6 | Evidence Review Agent | Evidence | EXISTS (engine) — `packages/evidence` health logic is real; agent wraps it, adds approval gate (MISSING today) |
| 7 | Policy Artifact Agent | Reporting / Controls | MISSING — no policy-drafting logic anywhere; `policies`/`policy_approvals`/`policy_attestations` tables exist and are empty |
| 8 | Readiness Scoring Agent | Readiness | MISSING (generation) — `frameworks` package has a readiness *formula* but no agent orchestration, no learning/career readiness tie-in |
| 9 | Remediation Agent | Remediation | MISSING — no gap → task pipeline exists; `activities` table in `lifecycle.ts` is the closest analog (logs, doesn't generate tasks) |
| 10 | Reporting Agent | Reporting | MISSING — `reports`/`board_report_jobs` tables exist, unpopulated |
| 11 | Career Portfolio Agent | Career Portfolio | PARTIAL — `capstone_projects`, `learner_portfolios`, `employment_outcomes` tables exist; no generation logic |
| 12 | Governance Supervisor Agent | Admin Governance | PARTIAL — `supervisor-agents` package is a stub; `RbacEngine` (governance-engine) is real and must be the enforcement backbone |

No 13th agent should be added without a documented gap in `docs/product/prd.md`, mirroring the same rule already in force for product modules (`CLAUDE.md`).

## Explicitly out of scope

Per the mission and `CLAUDE.md`'s "exactly 11 modules" rule, the Agent OS must **not** grow agents for capabilities outside the 11 listed ZIG modules — for example: generic chat/assistant agents unrelated to governance, agents for billing/invoicing automation beyond what `packages/billing` already covers, agents that operate on tenants/orgs outside ZIG's own multi-tenant model (e.g. cross-platform automation), or any agent whose purpose is not traceable to one of: AI Governance, GRC Learning, Framework Mapping, Risk Assessment, Controls, Evidence, Readiness, Remediation, Reporting, Career Portfolio, Admin Governance.

## Shared core → existing package mapping (build ON these, not beside them)

| Phase 2 shared core piece | Must reconcile/extend | Must NOT create a parallel implementation of |
|---|---|---|
| Agent Registry | `packages/agents` (`AgentOperatingSystem`, `AgentProfile`) **and** `packages/agent-registry` (`GovernedAgent`) — pick one canonical shape, migrate the other | A third registry shape |
| Event Fabric | `packages/agent-ingestion` (`AgentEventEnvelope`, `streamKey()`, 8 event types already named per the mission's vocabulary) | A new event envelope format |
| Runtime Kernel | `packages/runtime-queue` (job/attempt/backoff model) + `packages/runtime-persistence` (`RuntimeEntity` enum already lists agent_runs/agent_decisions/agent_tasks/agent_approvals/workflow_runs etc.) | A new queue or persistence abstraction |
| Context Layer | `apps/web/src/lib/auth/bootstrap.ts` (`BootstrapContext`: tenantId/userId/persona/organizationId) for user/org context; `packages/frameworks` for framework context; `packages/risks`/`controls`/`evidence` engines for their respective contexts | A new context type unrelated to `BootstrapContext` |
| Human Approval | `agent_approvals`, `agent_approval_workflows`, `policy_approvals` tables (already exist, unused) | New approval tables before confirming these are insufficient |
| Audit + Explainability | `agent_audit_traces`, `audit_logs`, `audit_events` tables; `lifecycle.ts`'s `createLifecycleActivity` pattern (actor/action/entity/metadata) as the template for shape | A new audit log table |
| Governance Guardrails | `packages/governance-engine/src/rbac/RbacEngine` (13 roles × 12 resources × 5 actions, real and complete) | A second RBAC matrix scoped to agents only |
| Observability | `packages/agent-telemetry`, `packages/agent-finops`/`agent-costing`, `agent_telemetry_events`/`agent_cost_feeds`/`agent_reliability_metrics` tables | New telemetry plumbing before checking these |

## Phase 4 migration scope correction

The mission's "Recommended tables" list overlaps heavily with what already exists. Corrected scope:

| Mission's proposed table | Reality |
|---|---|
| `agents` | Does not exist as a table — `governed_agents` exists and is closest; reconcile naming during registry unification, don't add a second |
| `agent_capabilities` | MISSING — genuinely new |
| `agent_permissions` | MISSING — genuinely new (RBAC matrix lives in code via `RbacEngine`, not a table; decide whether agent-tool permission scoping needs its own table or can extend `role_permissions`) |
| `agent_runs` | **EXISTS already** |
| `agent_steps` | MISSING — genuinely new |
| `agent_decisions` | **EXISTS already** (per `RuntimeEntity` enum / migration) |
| `agent_events` | **EXISTS already** |
| `agent_failures` | MISSING — closest existing analog is `agent_event_failures`; decide whether to extend that table or add a distinct one |
| `agent_replays` | MISSING — genuinely new |
| `agent_memory` | **EXISTS already** |
| `agent_context` | MISSING — genuinely new |
| `approval_requests` / `approval_decisions` | Closest existing: `agent_approvals`, `agent_approval_workflows` — extend, don't duplicate |
| `human_overrides` | MISSING — genuinely new |
| `agent_policies` | MISSING — genuinely new (distinct from product `policies` table) |
| `policy_violations` | MISSING — genuinely new |
| `agent_metrics` | Closest existing: `agent_telemetry_events`, `agent_reliability_metrics` — extend, don't duplicate |
| `agent_feedback` | Closest existing: `agent-telemetry`/`learning_agent_feedback` (learning-specific) — decide if a generic table is needed beyond the learning one |
| `agent_scorecards` | **EXISTS already** |

Phase 4 implementation must start from this corrected table, not the mission brief's literal list, to honor "do not break existing migrations" and "do not duplicate."

## Definition of "in scope" for any new agent code in Phase 3

A piece of agent logic is in scope only if it:
1. Maps to exactly one of the 12 agents above, and
2. That agent maps to exactly one of the 11 ZIG product modules per `CLAUDE.md`, and
3. It calls into an existing engine/table from the mapping above rather than re-implementing scoring/registry/event logic that already exists.

Anything that fails test 3 should be flagged for reconciliation before being merged, not built in parallel.
