# Career Path Crosswalk — Source C Learning Paths × Curriculum × Student Twin Scores

> Maps each of the 6 Source C named career Learning Paths to the Source B curriculum
> modules a learner would need, and to the `student_twins` score components their
> progress would feed. All score columns referenced are real, verified columns on the
> `student_twins` table (`supabase/migrations/202606180008_learning_agent_workforce.sql`
> lines 3-20). Columns marked "no writer" have no service writing to them today — see
> `HARMONIZATION_REPORT.md` Section 1.

## 1. Crosswalk table

| Career Path (Source C) | Required curriculum modules (Source B) | Primary `student_twins` columns it would drive | Column writer today |
|---|---|---|---|
| **GRC Analyst** | GRC Foundations, Asset Management, Risk Management, Control Management, Evidence Management | `knowledge_score` (assessments), `skills_score` (labs), `learning_score`/`career_score` (lesson completion) | `knowledge_score` ← `AssessmentService.submitAttempt`; `skills_score` ← `ScenarioService.scoreAndComplete`; `learning_score`/`career_score` ← `LearningService.completeLesson` — all real, verified writers |
| **Compliance Officer** | GRC Foundations, Control Management, Evidence Management, Framework Intelligence, Audit & Assessments | same four columns as above, plus eventual `certification_score` | `certification_score` has **no writer today** — see `CERTIFICATION_MODEL.md` |
| **Internal Auditor** | GRC Foundations, Audit & Assessments, Evidence Management, Framework Intelligence | same four, with lab output concentrated in `lab_artifacts.artifact_type = 'audit_finding'` | same as above |
| **Vendor Risk Analyst** | GRC Foundations, Third-Party & Vendor Risk, Risk Management, Control Management | same four, with lab output concentrated in `lab_artifacts.artifact_type = 'vendor_review'` | same as above |
| **Risk Manager** | GRC Foundations, Risk Management, Control Management, Framework Intelligence, AI Governance | same four, plus eventual `competency_score` for cross-module mastery | `competency_score` has **no writer today** — see `PORTFOLIO_ENGINE_ARCHITECTURE.md` for the proposed rollup logic |
| **CISO** | all 10 Source B modules + GRC Capstone | all four written columns, plus eventual `portfolio_score` (from `capstone_projects`/`learner_portfolios`) and `behavior_score`/`confidence_score` (no proposed writer in this document set — flagged as out of scope, see Section 2) | `portfolio_score` proposed in `PORTFOLIO_ENGINE_ARCHITECTURE.md`; `behavior_score`/`confidence_score` remain unaddressed |

## 2. Columns this crosswalk cannot account for

`behavior_score` and `confidence_score` on `student_twins` have no plausible source signal
identified anywhere in the verified codebase — no behavioral telemetry table, no
self-assessment/confidence-rating UI exists. This document does not invent a source for
them. They are flagged here as a genuine open question for the product owner: either (a)
define what behavioral/confidence signal should feed them and where it would be captured,
or (b) treat them as reserved-for-future columns and exclude them from the v1 rollup in
`PORTFOLIO_ENGINE_ARCHITECTURE.md` and `CERTIFICATION_MODEL.md`. This document recommends
(b) as the default until a concrete signal source is specified, since no UI captures
either signal today.

## 3. The module-reuse limitation, made concrete

Every career path above reuses "GRC Foundations" as a prerequisite. Under the current
schema, `learning_modules.learning_path_id` is a single foreign key
(`202606180001_batch_21_core_data_platform.sql` line 253), meaning a `learning_modules` row
belongs to exactly one `learning_paths` row. If "GRC Foundations" is built once as a
`learning_paths` row with its own modules, it **cannot** also be referenced as a leading
segment of "GRC Analyst," "Compliance Officer," "Internal Auditor," etc. without either:

1. Duplicating the lesson content as separate `learning_modules` rows under each career
   path's `learning_paths` row (content drift risk — five copies of the same lesson), or
2. Adding the `learning_path_modules` join table proposed in `CURRICULUM_CROSSWALK.md`
   Section 3, so a module can be referenced by multiple paths without duplication.

This document recommends option 2 but does not implement it — it is a decision for
whoever builds the Curriculum Authoring tooling referenced in
`LEARNING_OS_IMPLEMENTATION_ROADMAP.md`.
