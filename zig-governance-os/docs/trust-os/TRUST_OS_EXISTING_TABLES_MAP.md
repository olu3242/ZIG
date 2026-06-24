# Trust OS — Existing Tables Map

> Batch 1. Full table inventory from `supabase/migrations/*.sql` (17 migration files,
> `202606180001_batch_21_core_data_platform.sql` through
> `202606200004_create_lifecycle_certification.sql`), grouped by Trust OS relevance. Table
> names and key columns are copied verbatim from `CREATE TABLE` statements — nothing here is
> proposed or renamed.

## Tier 1 — direct Trust OS backbone (governance core)

| Table | Migration:line | Key columns |
|---|---|---|
| `organizations` / `tenants` | `202606180001_batch_21_core_data_platform.sql` | tenant root — every other table below has `tenant_id` |
| `projects` | same | `frameworkId` link, scoped under `tenant_id` |
| `assets` | same | governed asset records |
| `risks` | same | risk register |
| `risk_assessments` | same | governance-sense risk assessment history (consumed by `RiskService.findAssessments`) |
| `controls` | same | control library |
| `control_mappings` | same | cross-framework control crosswalk (consumed by `ControlService.findMappings`) |
| `control_evidence` | `202606180005_grc_core_engine.sql:111-121` | `control_id`, `evidence_id`, `coverage` ('supporting'/etc.) |
| `control_effectiveness` | `202606180005_grc_core_engine.sql:123-135` | `effectiveness_score`, `maturity_score`, `scoring_label` |
| `control_exceptions`, `control_owners`, `control_reviews`, `control_tests` | `202606180005_grc_core_engine.sql` | control lifecycle detail tables |
| `evidence` | `202606180001_batch_21_core_data_platform.sql:190-202` | `control_id`, `status` (default `'missing'`), `source_uri`, `submitted_at` |
| `evidence_collections`, `evidence_jobs`, `evidence_types` | various | evidence pipeline support tables |
| `evidence_reviews` | `202606180005_grc_core_engine.sql:229-240` | `evidence_id`, `reviewer_user_id`, `status` (default `'pending_review'`) |
| `frameworks`, `framework_versions`, `framework_domains`, `framework_controls`, `framework_requirements`, `framework_mappings`, `framework_crosswalks` | various | full framework metadata model — confirms CLAUDE.md's "frameworks are metadata" rule is already implemented at the schema level |
| `assessments` | `202606180001_batch_21_core_data_platform.sql:228` | governance-sense assessment table — **no service wraps it** (see services map) |
| `governance_scores` | `202606180001_batch_21_core_data_platform.sql:285-298` | `score`, `controls_implemented`, `evidence_coverage`, `risk_treatment`, `assessment_completion`, `explanation` — the real, current Governance Score model (see `TRUST_SCORE_MODEL.md`) |
| `recommendations` | `202606180001_batch_21_core_data_platform.sql:300` | tied to `governance_scores`/projects |
| `gap_assessments` | `202606180005_grc_core_engine.sql:360-372` | `gap_type`, `expected_count`, `missing_count`, `readiness_score`, `band` |
| `compliance_snapshots` | `202606180006_production_convergence.sql:135-145` | `compliance_score`, `posture_band`, `metrics jsonb` |
| `risk_snapshots` | `202606180006_production_convergence.sql:147` | point-in-time risk posture |
| `audits`, `audit_events`, `audit_findings`, `audit_logs`, `audit_programs`, `audit_recommendations`, `audit_remediations`, `audit_responses` | `202606180001_batch_21_core_data_platform.sql` and others | a full audit-engagement table family — currently **no `AuditEngagementService`** wraps these (the existing `AuditService` class is a different, audit-log concept — see Batch 1 capability audit) |
| `policies`, `policy_approvals`, `policy_attestations` | `202606180005_grc_core_engine.sql:319+` | policy lifecycle and attestation tracking |
| `tasks`, `reports` | various | terminal nodes of the Universal Governance Model chain |

## Tier 2 — Trust OS-adjacent, partially built

| Table | Migration:line | Notes |
|---|---|---|
| `vendors` | `202606190002_mvp_convergence_schema.sql:85-97` | `category`, `inherent_risk`, `assessment_status`, `risk_rating int 0-100`, **`questionnaire jsonb`** — this single jsonb column is the entire current questionnaire data model |
| `certifications`, `user_certifications` | `202606190003_mvp_plus_launch_schema.sql:51-67` | learner/professional credential issuance, `requirements jsonb`, `certificate_uri` |
| `certification_journeys` | `202606180008_learning_agent_workforce.sql:77` | learning-path-to-certification progression |
| `agent_certifications` | `202606180009_agent_governance_os.sql:82-94` | certifies Zig's own internal agents (`certification_level`, `passed_tests`), not customer compliance certifications |
| `ai_conversations`, `ai_messages` | `202606190002_mvp_convergence_schema.sql:99-118` | AI Coach chat history — not AI asset/risk governance |
| `governed_agents`, `agent_memory_policies`, `agent_audit_traces`, `agent_ledger`, `agent_evidence` | `202606180009_agent_governance_os.sql`, `202606180010_agent_production_convergence.sql` | governs Zig's *own* internal AI agent fleet (permissions, memory retention, audit trail, evidence export) — a useful pattern to model customer-facing AI Governance on, but scoped to Zig's internal agents today, not customer AI systems |

## Tier 3 — out of Trust OS scope (confirmed present, not touched)

`achievements`, `badges`, `quizzes`, `quiz_questions`, `quiz_attempts`, `lessons`, `labs`,
`lab_sessions`, `learning_paths`, `learning_modules`, `learning_cohorts`,
`learning_assessments`, `learning_assessment_results`, `learner_portfolios`,
`learner_skill_mastery`, `skill_nodes`, `xp_events`, `user_xp`, the full
`integration_*`/`connector_*` family, the full `billing_*`/`plans`/`subscriptions`/
`invoices`/`payments` family, `scenario_*`, `digital_twin_snapshots`,
`simulated_companies`, `student_twins`, `university_programs`, `corporate_academies`,
`employer_profiles`, `employment_outcomes`, `mentorship_matches`, `webhook_*`,
`workflow_*`, `runtime_*`, `model_*` (LLM cost/latency telemetry), and the entire
`agent_*` operational-telemetry family not already listed in Tier 2.

## Confirmed MISSING — no migration creates any of these tables

`questionnaires`, `questions`, `responses` (questionnaire response model), `trust_scores`,
`trust_records`, `trust_centers`, `ai_assets`, `ai_risks`, `ai_controls`, `ai_decisions`.
Any Trust OS data model (Batch 8) that needs these must propose them as genuinely net-new —
they do not exist under any name today.
