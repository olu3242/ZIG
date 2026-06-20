# Portfolio Engine Architecture

> How completed lessons, assessments, labs, and artifacts should roll up into a learner
> portfolio. Identifies the real schema gap and proposes the minimal addition — not a new
> service stack.

## 1. What exists today (verified)

| Signal source | Table | Real writer | What it captures |
|---|---|---|---|
| Lesson completion | `user_progress` | `LearningService.completeLesson` | per-module/lesson completion status, timestamp |
| Assessment results | `learning_assessment_results` | `AssessmentService.submitAttempt` | per-attempt score, pass/fail, missed question ids |
| Lab output | `lab_artifacts` | `ScenarioService.scoreAndComplete` | per-run score + structured artifact content (`risk_register`, `audit_finding`, etc.) |
| Aggregate learner signal | `student_twins` | piecemeal (`learning_score`, `career_score`, `knowledge_score`, `skills_score`) | a flattened, partial rollup — 4 of 9 columns written |
| Capstone | `capstone_projects` | **none** | `title`, `status`, `portfolio_score` — schema exists, zero writer |
| Curated portfolio | `learner_portfolios` | **none** | `validation_status`, `portfolio_score`, `resume_summary`, `linkedin_summary` — schema exists, zero writer |

**The gap is not "no portfolio table exists."** Two portfolio-shaped tables
(`capstone_projects`, `learner_portfolios`, both defined in
`202606180007_learning_os_e2e.sql` lines 96-121) already exist with exactly the fields a
portfolio rollup would need (`portfolio_score`, `resume_summary`, `linkedin_summary`,
`validation_status`). **The gap is that nothing writes to them.** This is a service gap,
not a schema gap.

## 2. Proposed rollup logic (specification only — not implemented)

A `PortfolioService` (new service, reusing the existing `BaseService<T>` pattern every
other service in `packages/services/src/` follows) would:

1. Read all `user_progress` rows for the learner (completed lesson count / total).
2. Read all `learning_assessment_results` for the learner (attempts, pass rate, latest
   scores — exactly what `AssessmentService.getLearnerAssessmentSummary` already computes;
   reuse it rather than re-querying).
3. Read all `lab_artifacts` for the learner's `scenario_runs` (completed labs, average
   score, artifact type distribution — exactly what `ScenarioService.getLearnerLabSummary`
   already computes; reuse it).
4. Read `capstone_projects` rows for the learner (status, portfolio_score if a capstone
   has been graded).
5. Combine into a single `portfolio_score` integer, written to both
   `student_twins.portfolio_score` and `learner_portfolios.portfolio_score` (find-or-create,
   same pattern as `LearningService.updateCareerSignal`).
6. Optionally generate `resume_summary`/`linkedin_summary` text — this would be the first
   genuinely AI-generated text in the Learning OS and should follow the explainability rule
   in `CLAUDE.md` ("every AI recommendation must be explainable") if implemented via an LLM
   call; until `AI_COACH_ARCHITECTURE.md`'s LLM client exists, this field should remain
   either empty or templated from the structured data in steps 1-4, not a black-box
   generation.

## 3. Proposed weighting (a starting point, not a final formula)

```
portfolio_score = round(
    0.30 * lesson_completion_percent      (from user_progress, via ProgressEngine)
  + 0.30 * assessment_pass_rate_percent   (from learning_assessment_results)
  + 0.30 * lab_average_score_percent      (from lab_artifacts)
  + 0.10 * capstone_score_percent_if_any  (from capstone_projects.portfolio_score, default 0 if no capstone)
)
```

This mirrors the explainable-scoring rule in `CLAUDE.md` ("every governance score must be
able to say why it is what it is") — each of the 4 weighted inputs is traceable to a real
table and a real existing computation already used elsewhere (`ProgressEngine`,
`AssessmentService`, `ScenarioService`). No weight here is final; it is a starting
specification for whoever implements `PortfolioService`.

## 4. What this document does not do

- It does not create `PortfolioService`.
- It does not write to `capstone_projects` or `learner_portfolios`.
- It does not implement resume/LinkedIn text generation.
- It does not address `behavior_score`/`confidence_score` — per
  `CAREER_PATH_CROSSWALK.md` Section 2, these are flagged as unaddressed pending a defined
  signal source.

## 5. Relationship to `/career` page

The existing `/career` page (`apps/web/app/career/page.tsx`) currently calls
`CareerReadinessEngine().score({ portfolio: 72, projects: 76, labs: 81, capstones: 69,
interview: 66, skills: 74, certifications: 70 })` — every input is a hardcoded literal
(verified, line 9). Per `HARMONIZATION_REPORT.md` Section 1, this page is a **MERGE**
candidate: once `PortfolioService` exists and writes real `portfolio_score`, this page
should read that real value instead of the hardcoded object, not run a parallel hardcoded
"Employment OS" concept alongside it.
