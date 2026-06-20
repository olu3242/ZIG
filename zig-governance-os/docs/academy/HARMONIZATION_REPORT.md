# Learning OS Harmonization Report

> Purpose: reconcile three sources of truth — (A) the existing implemented platform, (B)
> the "MVP curriculum" concept (10 named GRC training modules), and (C) the "Learning OS
> Blueprint" concept (Academy Tracks, Learning Paths as named careers, 5 named scenario
> companies) — into one architecture with no duplicate tables or services. This document
> is the classification ledger; `ZIG_LEARNING_OS_MASTER_BLUEPRINT.md` is the resulting
> target architecture.

Every classification below was verified by reading the actual file. No path, table, or
column listed here is invented. Where something does not exist, this is stated explicitly
rather than assumed.

## 1. Source A — existing routes, services, schema (verified)

### Routes (`apps/web/app/`)

| Route | File | Classification | Notes |
|---|---|---|---|
| `/learning` | `apps/web/app/learning/page.tsx` | **KEEP** | Lists `learning_paths`, shows assessment + lab summaries. Mixes real data (`services.learning.findMany`) with decorative, non-persisted "engine" calls (`SkillsGraph().iso27001Core()`, `AdaptiveLearningEngine().recommend([...hardcoded array...])`, `LearningAnalytics().operatingScore({...hardcoded...})`) — these render UI but write nothing to the DB. Flag for cleanup, not removal (zero-empty-states rule needs *some* visual content even pre-data). |
| `/learning/[id]` | `apps/web/app/learning/[id]/page.tsx` | **KEEP** | Real: `findById`, `findModules`, `getProgress`, enroll form. |
| `/learning/module/[id]` | `apps/web/app/learning/module/[id]/page.tsx` | **KEEP** | Thin navigation page; real `findModuleById`. |
| `/learning/lesson/[id]` | `apps/web/app/learning/lesson/[id]/page.tsx` | **KEEP / EXTEND** | Real progress read/write (`completeLessonAction`). Content section (lines 30-35) is one static paragraph — no diagram, video, or knowledge check. This is the gap `VISUAL_LEARNING_STANDARD.md` addresses. **Correction to brief's assumed path**: there is no `[id]/module/[id]/lesson/[id]` nested route; the real route is the flat `/learning/lesson/[id]`. |
| `/learning/practice-lab` | `apps/web/app/learning/practice-lab/page.tsx` | **KEEP** | Real: lists `scenarios`, launches `scenario_runs` via `launchLabAction`. |
| `/learning/practice-lab/[runId]` | `apps/web/app/learning/practice-lab/[runId]/page.tsx` | **KEEP** | Real: `lab_tasks`, `lab_task_submissions`, `lab_artifacts`, scoring action. This is the most fully wired page in the Learning OS. |
| `/learning/career` | `apps/web/app/learning/career/page.tsx` | not read in this pass | listed under `/learning/`, not in the required-route set; out of scope for this report. |
| `/learning/community`, `/learning/marketplace`, `/learning/instructor` | same dir | not read in this pass | likely decorative shells per the gap report's general finding (~95% of `packages/*` are single-file stubs); out of scope for this report; flag for future audit. |
| `/assessment` | `apps/web/app/assessment/page.tsx` | **KEEP** | Real: lists `learning_assessments`, shows pass/attempt summary. |
| `/assessment/[id]` | `apps/web/app/assessment/[id]/page.tsx` | **KEEP** | Real: renders `learning_assessment_questions`, submits via `submitAssessmentAction`. Honest empty state when no questions exist (line 38-40). |
| `/career` | `apps/web/app/career/page.tsx` | **REMOVE candidate / MERGE** | `CareerReadinessEngine().score({ portfolio: 72, projects: 76, labs: 81, ... })` — every input is a **hardcoded literal**, not read from `student_twins` or any table. `EmploymentOS()`/`EmployerMatchingEngine()` likewise produce decorative, non-persisted output. This page currently duplicates the *concept* of career readiness that `student_twins` already half-implements with real writes (see Source A schema below). Recommendation: do not build a parallel "Employment OS" concept; **MERGE** this page's intent into a future portfolio/career view that reads real `student_twins` columns (see `PORTFOLIO_ENGINE_ARCHITECTURE.md` and `CAREER_PATH_CROSSWALK.md`). Do not extend the hardcoded version further. |
| `/ai-command` | `apps/web/app/ai-command/page.tsx` | **KEEP shell / EXTEND blocked** | Static `StatCard`s (`value="0"`, `value="N/A"`) with an explicit comment "AI-generated records require the later AI platform batch." No LLM client, no conversation table. This is the literal route the canonical 11-module list calls "AI Command Center" — see Section 4 conflict note. |

### Services (`packages/services/src/`)

| Service | Classification | Real DB-backed methods (verified by reading the file) |
|---|---|---|
| `LearningService.ts` | **KEEP** | `findModules`, `findModuleById`, `enroll` (writes `user_progress`), `completeLesson` (writes `user_progress`, derives signal via `CompletionEngine`, writes `student_twins.learningScore`/`careerScore`), `getProgress` (reads via `ProgressEngine`), `getLearnerSummary`. |
| `AssessmentService.ts` | **KEEP** | `findAssessment`, `submitAttempt` (scores real submitted answers against `learning_assessment_questions.correctOptionIndex`, writes `learning_assessment_results`, writes `student_twins.knowledgeScore`), `getLearnerAssessmentSummary`. |
| `ScenarioService.ts` | **KEEP / EXTEND** | `findTasks`, `findSubmissions`, `findArtifacts`, `launchLab` (creates `scenario_runs` row), `completeTask` (writes `lab_task_submissions`, idempotent per task), `scoreAndComplete` (computes weighted score, writes `lab_artifacts`, writes `student_twins.skillsScore`), `getLearnerLabSummary`. The file's own header comment states the EXTEND decision explicitly: a separate `LabService` was rejected because `scenario_runs` already *is* the lab run record — this report concurs and treats that decision as settled, not open for re-litigation. |

No `CertificationService`, `CoachService`, `PortfolioService`, or `CareerService` exists anywhere in `packages/services/src/`. Any document below that proposes one is proposing new work, not documenting something that exists.

### Schema (verified directly from migration files)

| Table | Migration | Columns relevant to this report | Status |
|---|---|---|---|
| `learning_paths` | `202606180001_batch_21_core_data_platform.sql` (240-248) | `title`, `description`, `progress_percent` | **KEEP** — already structurally serves as "Academy Track" / "Learning Path" container (see Section 2). |
| `learning_modules` | same (250-259) | `learning_path_id` FK, `title`, `module_type` (`lesson`/`lab`/`exercise`), `duration_minutes` | **KEEP** |
| `scenarios` | same (261-270) | `project_id` FK, `name`, `description`, `framework_ids uuid[]` | **KEEP** — already the scenario-company container (see Section 5). |
| `scenario_runs` | same (272-283) | `scenario_id` FK, `status`, `score_delta`, `started_at`, `completed_at` | **KEEP** — doubles as the "lab run" record by deliberate design decision (`ScenarioService.ts` header comment). |
| `user_progress` | `202606180011_learning_progress_e2e.sql` (3-14) | `user_id`, `learning_path_id`, `module_id`, `lesson_id` (FK→`learning_modules`, same table — there is no separate `lessons` table), `status` (`enrolled`/`in_progress`/`completed`) | **KEEP** |
| `student_twins` | `202606180008_learning_agent_workforce.sql` (3-20) | 9 score columns: `knowledge_score`, `skills_score`, `competency_score`, `portfolio_score`, `certification_score`, `career_score`, `behavior_score`, `confidence_score`, `learning_score` — all `integer default 0` | **KEEP / EXTEND** — only 4 of 9 columns are currently written by any service (`learning_score`, `career_score` by `LearningService`; `knowledge_score` by `AssessmentService`; `skills_score` by `ScenarioService`). `competency_score`, `portfolio_score`, `certification_score`, `behavior_score`, `confidence_score` remain at their default of 0 with no writer. See `PORTFOLIO_ENGINE_ARCHITECTURE.md` and `CERTIFICATION_MODEL.md` for the proposed writers. |
| `learning_assessments` | `202606180007_learning_os_e2e.sql` (44-54) | `assessment_type`, `title`, `passing_score` | **KEEP** |
| `learning_assessment_questions` | `202606180012_assessment_questions_e2e.sql` (11-24) | `assessment_id` FK, `prompt`, `options jsonb`, `correct_option_index`, `weight`, `order_index` | **KEEP** |
| `learning_assessment_results` | `202606180007...` (56-68) | `assessment_id` FK, `learner_user_id`, `score`, `passed`, `remediation_skill_ids uuid[]` | **KEEP** |
| `lab_tasks` | `202606180013_lab_workflow_e2e.sql` (30-43) | `scenario_id` FK, `title`, `instructions`, `expected_output_type`, `weight`, `order_index` | **KEEP** |
| `lab_task_submissions` | same (47-59) | `scenario_run_id` FK, `lab_task_id` FK, `submitted_by`, `content jsonb`, `is_complete` | **KEEP** |
| `lab_artifacts` | same (64-77) | `scenario_run_id` FK, `artifact_type` (check-constrained to `risk_register`/`audit_finding`/`gap_assessment`/`evidence_record`/`vendor_review`), `content jsonb`, `score` | **KEEP** — this is the schema-correct home for scenario-company lab output (see `SCENARIO_ENGINE_ARCHITECTURE.md`). |
| `simulated_companies` | `202606180007...` (70-80) | `name`, `industry`, `maturity` | **KEEP, currently unseeded** — zero rows exist in any migration; zero references to "CloudPay", "HealthBridge", "RetailNova", "ManufacturX", or "GovSec" exist anywhere in the repo (migrations, code, or docs) — confirmed by full-repo grep. This is the correct table to seed those 5 names into, not a new table. |
| `simulated_company_objects` | same (82-94) | `simulated_company_id` FK, `object_type`, `name`, `status`, `payload jsonb` | **KEEP, unseeded** — deliberately left unextended per the migration's own comments. |
| `skill_nodes`, `learner_skill_mastery`, `adaptive_learning_recommendations` | `202606180007...` (3-42) | skill graph primitives | **KEEP, largely unwired** — `LearningPage` renders a hardcoded `SkillsGraph().iso27001Core()` array, not these tables. Flag as a future wiring gap, not a schema gap. |
| `capstone_projects`, `learner_portfolios` | same (96-121) | `portfolio_score`, `validation_status`, `resume_summary`, `linkedin_summary` | **KEEP, unwired** — no service references either table. Directly relevant to `PORTFOLIO_ENGINE_ARCHITECTURE.md`. |
| `learning_cohorts`, `mentorship_matches`, `employment_outcomes` | same (123-160) | — | **KEEP, unwired** — out of scope for this Learning OS blueprint; not touched by any proposal in this document set. |
| `certification_journeys`, `corporate_academies`, `university_programs`, `employer_profiles`, `learning_credentials`, `workforce_snapshots` | `202606180008_learning_agent_workforce.sql` | — | **KEEP, unwired** — `certification_journeys.readiness_score`/`.status` is the closest existing thing to a "certification eligibility flag" but is explicitly a different, untouched entity per `docs/certification/LEARNING_WORKFLOW_CERTIFICATION.md`. See `CERTIFICATION_MODEL.md` for why this report does NOT propose merging eligibility logic into it. |
| Conversation/message/chat table | — | **does not exist** | Confirmed by repo-wide grep (`conversation`, `chat_message`, `coach_session` — zero matches across `**/*.ts` and `**/*.sql`). Required for `AI_COACH_ARCHITECTURE.md`'s proposal; this report does not invent a fait-accompli schema, it proposes one as new work. |

No later migration ever `ALTER TABLE`s any of the above (confirmed by grep across all of `supabase/migrations/`) — the schema for these 12+ tables is final as of `202606180013`. Any new column proposed in this document set is new work, not a correction of something already there.

## 2. Source B (MVP curriculum) classification

Source B is a list of 10 named curriculum modules, not code. None of these names appear
literally as rows in any seed data (no seed/insert statements exist for `learning_paths`
in any migration — confirmed by grep). Classification is therefore about the **shape** of
where this content belongs, not about finding existing rows.

| Source B module | Classification | Where it belongs |
|---|---|---|
| GRC Foundations | Already covered by existing schema | One `learning_paths` row; its `learning_modules` rows (`module_type = 'lesson'`) are the lesson content. No new table needed. |
| Asset Management | Already covered by existing schema | Same — one `learning_paths` row, with `lab` modules pointing at `scenarios`/`lab_tasks` for hands-on asset inventory exercises. |
| Risk Management | Already covered by existing schema | Same shape; lab content can reuse `lab_artifacts.artifact_type = 'risk_register'`, which already exists as a check-constraint value. |
| Control Management | Already covered by existing schema | Same shape. |
| Evidence Management | Already covered by existing schema | Lab content maps to `lab_artifacts.artifact_type = 'evidence_record'` (already a valid constraint value). |
| Framework Intelligence | Already covered by existing schema | `learning_paths`/`learning_modules`; framework tagging via `scenarios.framework_ids uuid[]` (already exists, line 266 of `202606180001...`). |
| Audit & Assessments | Already covered by existing schema | `learning_assessments` + `learning_assessment_questions` already model this; lab content maps to `lab_artifacts.artifact_type = 'audit_finding'` (existing constraint value). |
| Third-Party & Vendor Risk | Already covered by existing schema | Lab content maps to `lab_artifacts.artifact_type = 'vendor_review'` (existing constraint value) — this is the fifth and last value in the check constraint, confirming the schema was already designed with vendor-risk lab output in mind. |
| AI Governance | Already covered by existing schema | Same `learning_paths`/`learning_modules` shape; no AI-specific table needed for the *curriculum content* (distinct from the AI Coach feature itself, which is a real gap — see `AI_COACH_ARCHITECTURE.md`). |
| GRC Capstone | Needs a new field/column, not a new table | `capstone_projects` table already exists (`202606180007...`, lines 96-107: `learner_user_id`, `title`, `status`, `portfolio_score`) but is completely unwired (no service references it). This is the correct home; it needs a writer (a `CapstoneService` or an extension of `LearningService`), not a new table. |

**No duplicate table is proposed for any Source B concept.** All 10 modules map onto the
existing `learning_paths` → `learning_modules` shape; the variation between modules is in
*content* (rows), not *schema*.

## 3. Source C (Learning OS Blueprint) classification

| Source C concept | Classification | Mapping |
|---|---|---|
| Academy Tracks (Governance, Risk, Compliance, Audit, Vendor Risk, Security Governance, BCM/DR, Executive Leadership) | Already covered by existing schema | Each track = one `learning_paths` row. `learning_paths` has no "track category" column today, but `title`/`description` already carry this without a schema change. If a queryable `track` taxonomy is wanted later, it is a **new column** on `learning_paths` (e.g. `track text`), not a new table — see `CURRICULUM_CROSSWALK.md`. |
| Learning Paths as named careers (GRC Analyst, Compliance Officer, Internal Auditor, Vendor Risk Analyst, Risk Manager, CISO) | Already covered by existing schema | Each career path = one `learning_paths` row whose `learning_modules` sequence draws from the Source B curriculum modules relevant to that role. This is a **naming/content decision**, not a schema decision — `learning_paths` already supports an arbitrary `title` per row. See `CAREER_PATH_CROSSWALK.md` for the exact module-to-path mapping. |
| Scenario Companies (CloudPay, HealthBridge, RetailNova, ManufacturX, GovSec) | Already covered by existing schema, currently unseeded | Each company = one `simulated_companies` row (`name`, `industry`, `maturity`) plus `scenarios` rows tied to it via `project_id` for lab delivery. **Important nuance**: `simulated_companies` and `scenarios` are two separate tables with no FK between them today (confirmed: `scenarios` has `project_id`, not `simulated_company_id`; `simulated_company_objects` has `simulated_company_id` but no FK to `scenarios`). `SCENARIO_ENGINE_ARCHITECTURE.md` proposes how to bridge this without a new table — by convention (naming/tagging), not a new join table, unless evidence emerges that a join table is unavoidable. |

## 4. The unresolved 11-module conflict — explicitly flagged, not resolved here

`CLAUDE.md` (lines 73-88) and `.claude/skills/zig-fable5-methodology/SKILL.md` both state
the product surface is **exactly 11 modules**: Mission Control, Project Builder, Scenario
Workspace, Asset Workspace, Risk Workspace, Control Workspace, Evidence Workspace, Task
Workspace, AI Command Center, Health Advisor, Executive Reporting — and that "a 12th module
needs a documented justification in `docs/product/prd.md` before it's built."

**Learning, Assessment, Labs (under `/learning/practice-lab`), and Career are not in this
list**, yet all four exist today as real, implemented routes and services (`/learning`,
`/assessment`, `/learning/practice-lab`, `/career`). `docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md`
already flags this same conflict independently ("the canonical 11-module list ... does not
include Learning, Labs, Career, or Vendor — flagged as an unresolved conflict requiring a
decision before Phase 3+").

This harmonization effort **does not resolve this conflict**. Two structurally different
resolutions are possible and neither is chosen here:

1. **Treat Learning/Academy as outside the 11-module product surface entirely** — a
   separate "Zig Academy" product area, documented and governed independently, that happens
   to share the same Supabase project and tenant model.
2. **Formally adopt Learning/Academy as a 12th module** (or fold its routes under "Scenario
   Workspace," since `scenarios`/`scenario_runs` already do double duty as the lab engine),
   with the required justification written into `docs/product/prd.md` per the existing rule.

**This is a decision for the project owner, not an agent.** Every document in this set
(especially `LEARNING_OS_IMPLEMENTATION_ROADMAP.md`) treats this as an open blocking
question rather than picking a side.

## 5. Summary ledger

| Decision | Count | Examples |
|---|---|---|
| KEEP (route/service/table as-is) | 18 | `learning_paths`, `scenario_runs`, `AssessmentService.submitAttempt`, `/assessment/[id]` |
| KEEP / EXTEND (real, but needs more writers/columns) | 4 | `student_twins` (5 of 9 columns unwritten), `ScenarioService` (lab-authoring tooling absent), `learning_modules`/`lesson` page (needs visual standard), `capstone_projects` (unwired) |
| MERGE (don't build parallel concept) | 1 | `/career` page's hardcoded `CareerReadinessEngine` — merge intent into real `student_twins`-backed portfolio view, do not extend the hardcoded version |
| REMOVE candidate | 0 outright | No table or service is recommended for deletion; the `/career` page's *current hardcoded implementation* is a removal candidate, but the route and its underlying intent are not. |
| New table proposed | 0 in this report | Every Source B/C concept maps onto existing tables. Proposals for new tables (conversation/message for AI Coach, possible certification-eligibility view) live in `AI_COACH_ARCHITECTURE.md` and `CERTIFICATION_MODEL.md` respectively, and are clearly marked as new work. |
| New column proposed | 2 (deferred to other docs) | Optional `learning_paths.track`; possible portfolio rollup field — both specified in `CURRICULUM_CROSSWALK.md`/`PORTFOLIO_ENGINE_ARCHITECTURE.md`, not created here. |
