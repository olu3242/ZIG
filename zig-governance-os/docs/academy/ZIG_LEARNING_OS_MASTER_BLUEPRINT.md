# Zig Learning OS — Master Blueprint

> Canonical target architecture reconciling Source A (implemented platform), Source B
> (MVP curriculum content), and Source C (Learning OS Blueprint: tracks, named career
> paths, scenario companies). This is the architecture all future ZIG Academy
> development must follow. It is a documentation artifact only — nothing here has been
> implemented as a result of writing this file.

## 1. Scope statement

This blueprint governs the learner-facing surface that today lives at `/learning`,
`/assessment`, `/learning/practice-lab`, and `/career` in `apps/web/app/`. It does **not**
modify, extend, or contradict the 11-module governance product surface defined in
`CLAUDE.md`. Where the two surfaces intersect (the unresolved module-count conflict), this
blueprint defers to `HARMONIZATION_REPORT.md` Section 4 and does not pick a resolution.

## 2. Layered architecture

```
                    ┌────────────────────────────────────────────┐
                    │            LEARNER EXPERIENCE LAYER          │
                    │  /learning  /assessment  /learning/practice-lab  /career │
                    └───────────────────┬──────────────────────────┘
                                        │
                    ┌───────────────────▼──────────────────────────┐
                    │              SERVICE LAYER (real, exists)      │
                    │  LearningService    AssessmentService    ScenarioService │
                    │  (packages/services/src/*.ts)                   │
                    └───────────────────┬──────────────────────────┘
                                        │
                    ┌───────────────────▼──────────────────────────┐
                    │           DATA-ACCESS LAYER (real, exists)     │
                    │  TenantRepository<T> over records.ts types     │
                    │  (packages/data-access/src/records.ts, repositories.ts) │
                    └───────────────────┬──────────────────────────┘
                                        │
                    ┌───────────────────▼──────────────────────────┐
                    │              SCHEMA LAYER (real, exists)        │
                    │  learning_paths → learning_modules → user_progress    │
                    │  learning_assessments → learning_assessment_questions │
                    │     → learning_assessment_results                     │
                    │  scenarios → scenario_runs → lab_tasks                 │
                    │     → lab_task_submissions → lab_artifacts             │
                    │  simulated_companies → simulated_company_objects (unseeded) │
                    │  student_twins (9 score columns, 4 of 9 written today) │
                    └────────────────────────────────────────────────┘
```

Three layers above are fully real today (schema, data-access, service). The learner
experience layer is partially real (3 of 4 surfaces have genuine read/write paths; `/career`
does not — see `HARMONIZATION_REPORT.md` Section 1).

## 3. The five domain concepts and where each one lives

| Domain concept | Owning table(s) | Owning service | Status |
|---|---|---|---|
| **Curriculum** (what to learn — Source B's 10 modules) | `learning_paths`, `learning_modules` | `LearningService` | Real, content-empty (no seed rows exist for any of the 10 named modules) |
| **Mastery & Assessment** (did you learn it) | `learning_assessments`, `learning_assessment_questions`, `learning_assessment_results` | `AssessmentService` | Real, content-empty (no seed questions exist) |
| **Applied Practice / Labs** (can you do it) | `scenarios`, `scenario_runs`, `lab_tasks`, `lab_task_submissions`, `lab_artifacts` | `ScenarioService` | Real, content-empty (no seed scenarios/tasks exist) |
| **Scenario Companies** (the fictional orgs labs are set in — Source C) | `simulated_companies`, `simulated_company_objects` | none (unwired) | Real schema, zero rows, zero service |
| **Learner Signal / Career Readiness** (the rollup — bridges Source A's `student_twins` and Source C's named career paths) | `student_twins` | written piecemeal by `LearningService`, `AssessmentService`, `ScenarioService` | Real, partially written (4 of 9 columns) |

## 4. How Source B (curriculum) and Source C (tracks/paths/companies) compose

```
Academy Track (Source C)                e.g. "Governance"
   └── Learning Path (Source C named career OR Source B module-grouping)
          e.g. "GRC Analyst" career path  OR  "GRC Foundations" curriculum module
          = one learning_paths row
          └── Learning Module (lesson | lab | exercise)
                 = learning_modules rows, FK learning_path_id
                 lesson  → rendered at /learning/lesson/[id]
                 lab     → rendered at /learning/practice-lab (via a linked scenarios row)
                 exercise→ rendered at /learning/module/[id] (generic shell today)
```

There is no schema distinction between a "Source B curriculum module" and a "Source C
named career path" — both are `learning_paths` rows. The distinction is editorial: a
curriculum module (e.g. "Risk Management") is a *building block*; a career path (e.g.
"Risk Manager") is a *sequence of building blocks*. `CAREER_PATH_CROSSWALK.md` specifies
this sequencing. This blueprint recommends representing a career path as its own
`learning_paths` row whose `learning_modules` are *references* to the underlying curriculum
content (today this would require either (a) the same `learning_modules` row appearing
under multiple `learning_paths` via a join, which the current schema does not support since
`learning_modules.learning_path_id` is a single FK, not a join table, or (b) duplicating
module rows per path. This tension is a real, named schema gap — see
`CURRICULUM_CROSSWALK.md` Section 3 for the proposed minimal fix (a `learning_path_modules`
join table) rather than silently picking (a) or (b).

## 5. How scenario companies attach to labs

```
simulated_companies (Source C: CloudPay, HealthBridge, RetailNova, ManufacturX, GovSec)
   — currently zero rows, no FK to scenarios —
   convention-based link proposed in SCENARIO_ENGINE_ARCHITECTURE.md:
   scenarios.name or scenarios.description carries the company name,
   OR (if stronger binding is needed) scenarios gains a new
   simulated_company_id FK column — both options are laid out, neither is built here.

scenarios (real, tenant+project scoped)
   └── lab_tasks (ordered, weighted)
          └── lab_task_submissions (per scenario_run)
   └── scenario_runs (the "lab run")
          └── lab_artifacts (scored output: risk_register | audit_finding |
                              gap_assessment | evidence_record | vendor_review)
```

## 6. How the learner signal rolls up

```
LearningService.completeLesson()   → student_twins.learning_score, career_score
AssessmentService.submitAttempt()  → student_twins.knowledge_score
ScenarioService.scoreAndComplete() → student_twins.skills_score
                                    ↓
                    [NO WRITER TODAY for:]
                    competency_score, portfolio_score,
                    certification_score, behavior_score, confidence_score
                                    ↓
                    [PROPOSED, NOT BUILT — see PORTFOLIO_ENGINE_ARCHITECTURE.md
                     and CERTIFICATION_MODEL.md]
                    A rollup reads all 9 columns + capstone_projects +
                    learner_portfolios to derive portfolio readiness and
                    certification eligibility.
```

## 7. What this blueprint explicitly does NOT do

- It does not create any new table. Every box in the diagrams above that says "real" is a
  table verified to exist today by reading the migration files (see `HARMONIZATION_REPORT.md`
  Section 1 for citations).
- It does not resolve the 11-module conflict (Section 1 above, full detail in
  `HARMONIZATION_REPORT.md` Section 4).
- It does not seed any data, write any migration, or modify any service.
- It does not decide between the convention-based vs. FK-based scenario-company linkage —
  that decision is deferred to whoever implements `SCENARIO_ENGINE_ARCHITECTURE.md`.
