# ZIG Agent OS — Gap Report

> Phase 1 audit. Written before any Agent OS implementation, per mission instructions:
> "Audit first, then extend." All findings below are grounded in actual file paths,
> function names, and table names found in the repository — not inferred from naming
> conventions. Where something could not be verified directly it is marked as such.

Audit scope: `apps/web`, `packages/*` (130+ internal workspace packages), `supabase/migrations/*.sql`,
and any test files referencing the areas below. Conducted 2026-06-22.

## Legend

| Mark | Meaning |
|---|---|
| **EXISTS** | Fully implemented and usable as-is for the Agent OS to build on. |
| **PARTIAL** | A real abstraction/schema exists, but key parts (runtime, enforcement, content, tests) are missing. |
| **MISSING** | Searched for and not found, or found only as inert UI/scaffold with no logic. |
| **DUPLICATE RISK** | More than one inconsistent implementation of the same concept exists. |
| **NEEDS REFACTOR** | Implementation exists but conflicts with the Agent OS architecture this mission requires and should be reconciled, not bypassed. |

---

## 1. Existing agents

**Verdict: PARTIAL + DUPLICATE RISK**

- `packages/agents/src/index.ts` — `AgentOperatingSystem` class. `AgentKey` enum (12 types: compliance, risk, audit, policy, vendor_risk, evidence, control, assessment, executive, certification, learning, automation). `AgentLifecycleStage`: observe → analyze → recommend → execute → validate → learn → report. `agentRegistry: AgentProfile[]` — hardcoded array of 12 profiles. `plan()` returns an `AgentActionPlan` (stage, `requiresApproval`, `auditLabel`).
- `packages/agent-registry/src/index.ts` — a **second, independent** `AgentRegistry` class with a different shape: `GovernedAgent` (id, name, type, owner, department, supervisor, permissions, tools, status, version, certificationLevel). `inventory()` returns 3 hardcoded agents (tutor, risk, automation).
- 22 more `packages/agent-*` packages (agent-alerting, agent-approvals, agent-audit, agent-certification, agent-chaos, agent-control-tower, agent-costing, agent-finops, agent-handoffs, agent-ingestion, agent-ledger, agent-memory, agent-performance, agent-raci, agent-reliability, agent-risk, agent-scorecards, agent-self-healing, agent-telemetry, agent-workforce, plus `learning-agents`, `supervisor-agents`) — each is a skeletal type-definitions-plus-one-or-two-methods stub. No execution engine in any of them.

**Why this matters for Phase 2/3:** there are already two competing notions of "agent registry" with incompatible shapes. The mission's Agent Registry (capabilities, allowed tools, permission scope, input/output schema, confidence threshold, escalation rule) must **reconcile**, not duplicate, `packages/agents` and `packages/agent-registry`. Building a third registry would be the exact duplication the mission prohibits.

## 2. Existing AI coach logic / AI Command Center

**Verdict: MISSING**

- `apps/web/app/ai-command/page.tsx` is a static UI page: stat cards showing "Generated Records: 0", "Confidence Floor: N/A"; four "command starter" buttons that are not wired to any action.
- `packages/ai-governance/src/index.ts` defines `AiGovernanceLayer.canExecute()` — a trivial boolean policy check (`auditLogging && piiProtection && !approvalRequired`), not an enforcement layer.
- No LLM client, no prompt templates, no generation pipeline, no `packages/ai` content beyond a stub exists anywhere in the repo.

There is nothing here to reuse for agent decision-making itself; the new runtime kernel (Phase 2) will be the first real execution logic in the repo.

## 3. Existing learning modules

**Verdict: PARTIAL**

- Routes exist under `apps/web/app/learning/` (`/learning`, `/learning/[id]`, `/learning/lesson/[id]`, `/learning/module/[id]`, `/learning/practice-lab`, `/learning/career`, plus `/community`, `/instructor`, `/marketplace`) — all are UI scaffolding with no content delivery.
- `packages/learning-os`, `packages/learning-kernel`, `packages/learning-analytics`, `packages/certification-readiness` define a progression model (`missionPath()`: beginner → practitioner → professional → lead → architect → executive) and scoring averages, but no actual lesson/lab/assessment content and no progress-tracking writes.
- Supabase has 23 learning/career tables (`learning_modules`, `learning_paths`, `learning_assessments`, `learning_assessment_results`, `capstone_projects`, `learner_portfolios`, `learner_skill_mastery`, `employment_outcomes`, `mentorship_matches`, `skill_nodes`, `adaptive_learning_recommendations`, `apprenticeship_runs`, `apprenticeship_events`, `certification_journeys`, `corporate_academies`, `employer_profiles`, `learning_agent_runs`, `learning_agent_feedback`, `learning_credentials`, `student_twins`, `university_programs`, `workforce_snapshots`) plus a gamification layer (`quizzes`, `quiz_questions`, `quiz_attempts`, `achievements`, `badges`, `user_xp`, `xp_events`, `user_certifications`).

The Learning Path Agent and Career Portfolio Agent (Phase 3) have real tables to write to, but no existing service layer to call — they will be the first thing to actually populate these tables meaningfully.

## 4. Existing risk/control/evidence tables and logic

**Verdict: EXISTS** (the most mature domain in the repo)

- `packages/risks/src/index.ts` — `RiskManagementEngine.score()`: inherent risk = `(likelihood * impact) / 25 * 100`; residual risk adjusts for control/treatment effectiveness. `TreatmentStrategy` (mitigate/transfer/accept/avoid), `RiskBand` (critical/high/medium/low/informational).
- `packages/controls/src/index.ts` — `ControlManagementEngine.assess()`: averages implementation%, test pass rate%, evidence coverage%, maturity%; bands into not_implemented → optimized.
- `packages/evidence/src/index.ts` — `EvidenceManagementEngine.health()`: current/expired/missing/pending_review/rejected/approved based on existence, review status, expiry.
- `apps/web/app/lib/lifecycle.ts` — the real, working CRUD layer: `createLifecycleProject/Asset/Control`, `linkLifecycleAssetControl`, `updateLifecycle*`, `archiveLifecycle*`, `createLifecycleActivity` (writes every mutation to an activities table with actor/action/entity), `calculateCreateGovernanceScore()` (20/30/30/20 weighting), `classifyAsset()` (returns a canned classification string — not real AI).
- Supabase: 22 tables across risk (8), control (7), evidence (5), plus `gap_assessments`.

**Gap that Phase 3 agents must fill, not rebuild:** no approval gate on evidence rejection, no automated control testing, no exception workflow. The Risk Assessment Agent, Control Advisor Agent, and Evidence Review Agent should call into `lifecycle.ts` and the three scoring engines above rather than re-implementing scoring.

## 5. Existing framework mapping logic

**Verdict: PARTIAL + minor DUPLICATE RISK**

- `packages/framework-engine/src/FrameworkRegistry.ts` — `FrameworkCode` enum with 6 frameworks (ISO27001, NIST_CSF, SOC2, HIPAA, PCI_DSS, CIS_CONTROLS), used directly by `apps/web/app/lib/actions.ts`'s `onboardingAction` to seed a tenant's frameworks.
- `packages/frameworks/src/index.ts` — a **second**, broader `FrameworkCode` enum (9 frameworks: adds ISO27001_2022, NIST_800_53_Rev5, GDPR, CMMC, custom) with domain lists per framework and a `FrameworkIntelligenceEngine.score()` readiness calculator (green ≥75%, amber ≥50%, red <50%).
- Supabase: `frameworks`, `framework_requirements`, `framework_controls`, `framework_domains`, `framework_mappings`, `framework_crosswalks`, `framework_versions`.

**Gap:** no requirement-to-control resolution, no crosswalk logic despite the table existing, no AI-assisted mapping. The mission's required framework list (NIST AI RMF, ISO 27001, SOC 2, HIPAA, GDPR, NIST CSF, CIS Controls, PCI DSS) is a superset of `packages/frameworks`' 9 and only needs NIST AI RMF added — it should extend that registry, not `framework-engine`'s narrower one, and the two should eventually be reconciled.

## 6. Existing readiness/reporting routes

**Verdict: MISSING (generation logic); EXISTS (schema only)**

- `apps/web/app/reports/page.tsx` lists 5 hardcoded report types with no backend.
- `apps/web/app/dashboard/page.tsx`, `apps/web/app/mission-control/page.tsx` are layout scaffolds with no data queries.
- Supabase has `reports` and `board_report_jobs` tables but nothing populates them.

The Readiness Scoring Agent and Reporting Agent are net-new logic, not a refactor.

## 7. Existing admin/governance routes

**Verdict: PARTIAL**

- `apps/web/app/settings/`, `/settings/organization`, `/settings/billing` are UI stubs.
- `packages/governance-engine/src/rbac/RbacEngine.ts` — a real, complete RBAC matrix: 5 actions (view/create/edit/delete/approve) × 12 resources × 13 roles, with `canView/canCreate/canEdit/canDelete/canApprove/can()` helpers. This is genuinely usable.
- Supabase: `roles`, `permissions`, `role_permissions`, `organization_memberships`, `audit_logs`, `audit_events`.

**This is the file the Governance Guardrails layer (Phase 2.7) must call into** — `RbacEngine` already defines the permission matrix the Agent Registry's "permission scope" and "allowed tools" fields need to respect. Do not define a second RBAC matrix for agents.

## 8. Existing event/workflow/runtime services

**Verdict: PARTIAL + DUPLICATE RISK**

- `packages/automation/src/index.ts` — `AutomationEngine`: 8 triggers, 6 condition operators, 7 actions, full condition-evaluation logic, `execute()` returns success/skipped/failed.
- `packages/autonomous-workflows/src/index.ts` — a second, simpler workflow concept (`AutonomousWorkflowType`, `AutonomousExecutionMode`, `.plan()` only sets `approvalRequired = mode !== "manual"`).
- `packages/runtime-queue/src/index.ts` — in-memory job model: `enqueue()`, `nextAttempt()` (dead-letters after `maxAttempts`), `backoffMs()` exponential backoff. **No actual broker** — this is a data structure, not a running queue.
- `packages/webhooks/src/index.ts` — `WebhookRouter.shouldRetry()/nextStatus()` retry-state-machine logic, also in-memory only.
- `packages/agent-ingestion/src/index.ts` — `AgentEventEnvelope`, `streamKey()` (`tenantId:source:agentId`), 8 `AgentEventType`s already named almost identically to what Phase 2's Event Fabric needs (`agent_started`, `agent_completed`, `agent_failed`, `agent_escalated`, `agent_approved`, `agent_rejected`, `agent_suspended`, `agent_recovered`).
- `packages/runtime-persistence/src/index.ts` — `RuntimeEntity` enum already lists `agent_runs`, `agent_decisions`, `agent_tasks`, `agent_approvals`, `workflow_runs/steps/results`, `evidence_jobs`, `board_report_jobs`, `compliance_snapshots`, `risk_snapshots`, `runtime_events`, `runtime_metrics` — this is very close to the Phase 2 Runtime Kernel's persistence needs already.

**This is the highest duplication-risk area.** `packages/automation` and `packages/autonomous-workflows` overlap conceptually; `agent-ingestion` already has most of the Event Fabric's event taxonomy. Phase 2's Event Fabric and Runtime Kernel should be built as the thing that finally wires `agent-ingestion` + `runtime-queue` + `runtime-persistence` together into one real, working pipeline — not a fourth parallel event system.

## 9. Existing Supabase migrations

**Verdict: EXISTS (schema), MISSING (population/enforcement)**

~195 tables across 17 migrations (`202606180001`–`202606200004`). Of direct relevance to this mission, agent-related tables **already exist**:

`governed_agents, agent_runs, agent_tasks, agent_approvals, agent_memory, agent_audit_traces, agent_certifications, agent_finops_metrics, agent_handoffs, agent_memory_policies, agent_raci_assignments, agent_risk_register, agent_scorecards, agent_self_healing_events, agent_soc_events, agent_telemetry_events, agent_approval_workflows, agent_alert_routes, agent_alert_deliveries, agent_events, agent_event_stream, agent_event_failures, agent_evidence, agent_ledger, agent_ledger_hashes, agent_cost_feeds, agent_reliability_metrics, agent_chaos_runs, model_costs, model_failures, model_latency, model_usage, supervisor_validations` (32 tables).

**This is a critical finding for Phase 4: most of the "Recommended tables" in the mission brief already exist under slightly different names** (e.g. `agent_runs`, `agent_approvals`, `agent_events` already exist; `agent_decisions`/`agent_steps`/`agent_failures`/`agent_replays`/`agent_context`/`approval_requests`/`approval_decisions`/`human_overrides`/`agent_policies`/`policy_violations`/`agent_metrics`/`agent_feedback` are the real gaps). Phase 4 must map onto these existing tables and only add what's genuinely missing — re-creating `agent_runs` etc. under new names would be a direct violation of "do not break existing migrations" and "do not duplicate."

RLS policies exist on these tables (need to be reviewed per-table at Phase 4 time, not assumed sufficient).

## 10. Existing tests

**Verdict: MISSING**

Only 8 test files in the entire monorepo: `packages/auth/src/tests/{oauth,auth,session,middleware}.spec.ts`, `packages/data-access/src/tests/{tenant-isolation,supabase-adapter}.test.ts`, `packages/services/src/tests/{service-layer,vertical-slice}.test.ts`. Zero tests for any agent package, learning package, risk/control/evidence engine, framework engine, automation/workflow package, or any `apps/web` route. A `tests/e2e/` directory exists but was not inspected in depth.

**Phase 7 is not optional polish — it is filling a near-total void.** Tenant isolation and RBAC enforcement tests are the most urgent given zero current coverage and the mission's hard requirement that every agent respect both.

---

## Top risks to address before/during Phase 2

1. **Registry duplication** (`packages/agents` vs `packages/agent-registry`) must be reconciled into the single Agent Registry the mission specifies — pick one shape, migrate the other's concepts in, do not add a third.
2. **Workflow/event duplication** (`packages/automation` vs `packages/autonomous-workflows`, plus `agent-ingestion`/`runtime-queue`/`runtime-persistence` already covering most of "Event Fabric" and "Runtime Kernel") means Phase 2 is largely an integration job, not a from-scratch build.
3. **Migration table overlap** — Phase 4 must diff against the ~32 existing `agent_*` tables before adding anything.
4. **Framework registry duplication** (`framework-engine` vs `frameworks`) should be resolved when the Framework Mapping Agent is built, since it needs the superset.
5. **RBAC must be reused, not reinvented** — `governance-engine/RbacEngine` is real and complete; Governance Guardrails (Phase 2.7) wraps it, doesn't replace it.
