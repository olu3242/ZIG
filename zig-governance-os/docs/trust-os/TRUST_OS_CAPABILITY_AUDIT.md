# Trust OS Capability Audit

> Batch 1 of 10 — Harmonization & Foundation. This is an audit document only: it states
> what exists in the codebase today, with file:line evidence, so later Trust OS batches do
> not propose anything that already exists or contradicts what's already built. No code or
> schema in this document is new; everything cited below is real and currently in the repo.

## Method

This audit greps and reads `packages/services/src/`, `packages/*/src/`,
`supabase/migrations/*.sql`, and `apps/web/app/` directly rather than relying on
`docs/architecture/` claims, because several `docs/architecture/` files (e.g.
`docs/data/entities.md`, `docs/architecture/governance-scoring-engine.md`) are still marked
`STATUS: STUB` and do not reflect the current schema. Every claim below cites the literal
file and line.

## Classification legend

- **EXISTS** — implemented, exported, and wired into a service/table/route, with working
  logic beyond a type declaration.
- **PARTIAL** — a type, table, or stub class exists, but the capability is incomplete (no
  query logic, no route, or only a placeholder method).
- **MISSING** — nothing found under any reasonable name.

## Core governance services (`packages/services/src/`)

| Service | Status | Evidence |
|---|---|---|
| `FrameworkService` | EXISTS | `packages/services/src/FrameworkService.ts:4` — extends `BaseService<FrameworkRecord>`, adds `findAvailableFrameworks()` filtering `status: "active"`. |
| `GovernanceService` | EXISTS | `packages/services/src/GovernanceService.ts:4` — extends `BaseService<GovernanceScoreRecord>`, adds `findRecommendations(context, projectId)` over a `RecommendationRecord` repository. |
| `AssessmentService` | **MISSING** | No file named `AssessmentService.ts` anywhere under `packages/*/src`. The nearest things are `packages/assessment-engine/src/index.ts` (an `AssessmentEngine` class — see below) and the `assessments` table (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:228`), but there is no service class wrapping that table. |
| `RiskService` | EXISTS | `packages/services/src/RiskService.ts:4` — extends `BaseService<RiskRecord>`, adds `findAssessments(context, riskId)` over a `RiskAssessmentRecord` repository. |
| `ControlService` | EXISTS | `packages/services/src/ControlService.ts:4` — extends `BaseService<ControlRecord>`, adds `findMappings(context, sourceControlId)` over `ControlMappingRecord`. |
| `AuditService` | PARTIAL | `packages/services/src/AuditService.ts:3` — this is an **audit-log/audit-trail** writer (`recordAction(context, action, entityTable, entityId, reason)` writing to an `AuditSink`), not a governance-audit-engagement service. It does not manage the `audits`, `audit_findings`, `audit_programs`, or `audit_remediations` tables. |
| `EvidenceService` | EXISTS | `packages/services/src/EvidenceService.ts:4` — extends `BaseService<EvidenceRecord>`, adds `findByControl(context, controlId)`. |

All seven are assembled in `packages/services/src/factory.ts:1-39` (`createServices()`), which is the canonical service container — `tenants`, `users`, `audit`, `frameworks`, `projects`, `assets`, `risks`, `controls`, `evidence`, `learning`, `scenarios`, `governance`. Note **`assessments` is absent from `ZigServices`** in `factory.ts:14-26` — confirming AssessmentService is genuinely missing from the canonical service layer, not just differently named.

## Adjacent "engine" packages that look like services but aren't governance assessment

| Package | Status | Evidence |
|---|---|---|
| `packages/assessment-engine/src/index.ts` | PARTIAL (wrong domain) | Defines `AssessmentEngine.grade(type, score, remediationSkillIds)` for `AssessmentType = "quiz" \| "exam" \| "scenario_exam" \| "lab_validation" \| "capstone_grading" \| "practical_exam"` — this is a **learning/certification quiz grader**, not a governance/control-readiness assessment engine. |
| `packages/assessment-os/src/index.ts` | PARTIAL (wrong domain) | `AssessmentOS.composite(score)` averages `knowledge, skill, competency, confidence, mastery` — also a learner-competency composite score, not a GRC assessment. |
| `packages/ai-governance/src/index.ts` | PARTIAL | 14 lines: `AiGovernancePolicy` interface (`agentPermissions`, `approvalRequired`, `piiProtection`, `auditLogging`, `promptGovernance`, `modelGovernance`) and `AiGovernanceLayer.canExecute(policy)` — a single boolean gate. No AI asset/risk/control/decision tracking, no persistence, no route. |
| `packages/knowledge-graph/src/index.ts` | PARTIAL | 12 lines: `KnowledgeNode` union type (`organizations \| frameworks \| controls \| policies \| risks \| audits \| evidence \| vendors \| regulations \| certifications`), `KnowledgeRelationship` union, and a single `KnowledgeGraph.edge()` factory function that returns a plain object — no graph storage, no traversal, no persistence. This is a type sketch, not a working graph. |

## Vendor / questionnaire / trust-specific capabilities

| Capability | Status | Evidence |
|---|---|---|
| Vendor management | PARTIAL | Table `vendors` exists: `supabase/migrations/202606190002_mvp_convergence_schema.sql:85-97` — columns `id, tenant_id, name, category, inherent_risk, assessment_status, risk_rating, questionnaire jsonb, created_at, updated_at`. Route exists: `apps/web/app/vendors/page.tsx`, `apps/web/app/vendors/[id]/page.tsx`. **No `VendorService` class exists** in `packages/services/src/` — the table and UI exist without a service layer. |
| Questionnaire / Questionnaire Agent | PARTIAL | The only "questionnaire" artifact in the entire codebase is the single `questionnaire jsonb` column on the `vendors` table (`...mvp_convergence_schema.sql:93`). There is no `questionnaires` table, no `questions` table, no `responses` table, no questionnaire service, and no questionnaire route. There is also no agent named "Questionnaire Agent" anywhere in `packages/agent-*`. |
| Trust Score / Trust Record | MISSING | No table, type, or service named `trust_score`, `trust_record`, or similar exists anywhere in `supabase/migrations/*.sql` or `packages/*/src`. The closest existing concept is `governance_scores` (see Batch 9). |
| Trust Center (public-facing trust page) | MISSING | No route, component, or doc references a public trust page. `apps/web/app/` has no `trust` or `trust-center` directory. |
| AI Governance (AI asset/risk/control/decision tracking) | MISSING | No tables `ai_assets`, `ai_risks`, `ai_controls`, or `ai_decisions` exist. The only AI-governance-adjacent tables are `ai_conversations` and `ai_messages` (`...mvp_convergence_schema.sql:99-110`, AI Coach chat history) and the agent-fleet-governance tables under the `agent_*` family (`agent_governance_os.sql`, `agent_production_convergence.sql` — these govern Zig's own internal AI agents, not customer AI systems). |
| Certification tracking | EXISTS (learning-credential scope only) | Tables `certifications` and `user_certifications` exist: `supabase/migrations/202606190003_mvp_plus_launch_schema.sql:51-67` (`certifications.requirements jsonb`, `user_certifications.status/certificate_uri/issued_at`). Also `certification_journeys` (`202606180008_learning_agent_workforce.sql:77`) and `agent_certifications` for governed agents (`202606180009_agent_governance_os.sql:82-94`). All three are **learner/agent credentialing**, not compliance/audit certification (e.g. SOC 2 Type II issuance) tracking. |
| Knowledge Graph (working, persisted) | PARTIAL | See `packages/knowledge-graph/src/index.ts` above — type-only. The *documentation* concept of a graph is much further along: `docs/convergence/governance-graph.md` and `docs/convergence/knowledge-graph.md` already describe a full Tenant→Project→Asset→Risk→Control→Framework→Evidence→Task spine with knowledge objects (Gap, Signal, Insight, Recommendation, Readiness State) — but no code implements it yet. |
| Scenario services | EXISTS | `packages/services/src/ScenarioService.ts:4` — extends `BaseService<ScenarioRecord>`, adds `findRuns(context, scenarioId)`. Backed by tables `scenarios`, `scenario_runs`, `scenario_instances`, `scenario_templates`. |
| Learning services | EXISTS | `packages/services/src/LearningService.ts:4` — extends `BaseService<LearningPathRecord>`, adds `findModules()`. Backed by a large family of tables (`learning_paths`, `learning_modules`, `learning_cohorts`, `lessons`, `labs`, `quizzes`, etc.) and ~25 `packages/learning-*` and `packages/agent-learning-career` packages. This is the most mature subsystem in the repo by package count, and is out of scope for Trust OS except where certification/credentialing overlaps (see Batch 6/10). |

## Bottom line for Batch 1

- **Strong reusable foundation**: `EvidenceService`, `ControlService`, `RiskService`, `FrameworkService`, `GovernanceService`, plus the underlying `evidence`, `evidence_reviews`, `control_evidence`, `control_effectiveness`, `governance_scores`, `recommendations`, `gap_assessments`, and `compliance_snapshots` tables are real, tenant-scoped, and directly reusable as the backbone for Trust Score, Evidence Vault, and Trust Knowledge Graph.
- **Genuinely missing, must be built net-new**: Questionnaire Agent (and its data model), Trust Center (public-facing surface), AI Asset/AI Risk/AI Control/AI Decision tracking, and a real (persisted, traversable) Knowledge Graph implementation.
- **Partial and reusable with extension**: vendor risk management (table + route exist, service layer does not), AI governance (a policy-gate stub exists, no asset/risk tracking), knowledge graph (type sketch + a complete design doc, no implementation), certification tracking (exists for learners/agents, not for compliance attestations).
- **Naming collision to resolve, not duplicate**: "Assessment" already means two different things in this codebase — a governance/control assessment (the `assessments` and `risk_assessments` tables, with no dedicated service) and a learner competency assessment (`AssessmentEngine`, `AssessmentOS`, `learning_assessments`). Trust OS questionnaire/assessment work must build on the former and must not collide names with the latter.

See `TRUST_OS_EXISTING_SERVICES_MAP.md`, `TRUST_OS_EXISTING_TABLES_MAP.md`, and
`TRUST_OS_EXISTING_ROUTES_MAP.md` for the full per-area breakdown.
