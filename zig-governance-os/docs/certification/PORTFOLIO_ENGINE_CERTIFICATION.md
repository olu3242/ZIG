# Portfolio Engine Certification

**Date:** 2026-06-20
**Scope:** Close the schema-gap-vs-service-gap named in `docs/academy/PORTFOLIO_ENGINE_ARCHITECTURE.md`:
`capstone_projects` and `learner_portfolios` already existed in the schema (with RLS and
`updated_at` triggers already applied via the `do $ ... loop` block in
`202606180007_learning_os_e2e.sql`), but no application-layer repository or service ever
read or wrote to them, and `student_twins.portfolioScore` had no writer anywhere in the
codebase.

## What this closes

Per the audit performed before this change (cross-referencing `docs/academy/*` against
the actual codebase), the WAVE 2 request's Portfolio Engine was the highest-value,
already-fully-specified, genuinely-unimplemented gap — everything else requested in that
wave (Framework Intelligence engines, named AI agents, Career OS resume/LinkedIn/interview
tooling) either already exists in large part or has no committed spec to implement against
yet. This change implements only the Portfolio Engine, per the existing spec, without
duplicating any existing table, repository, or service.

## Code changes

- **`packages/types/src/index.ts`** — added `CapstoneProject` and `LearnerPortfolio`
  interfaces, matching the column shapes already defined in
  `202606180007_learning_os_e2e.sql`.
- **`packages/data-access/src/records.ts`** — added `CapstoneProjectRecord` and
  `LearnerPortfolioRecord` type aliases, following the established `X & { createdAt: Date;
  updatedAt: Date }` pattern used by every other record type in this file.
- **`packages/data-access/src/repositories.ts`** — registered `capstoneProjects` and
  `learnerPortfolios` as `TenantRepository` entries in `ZigRepositories`, wired against both
  the Supabase-backed (`capstone_projects`, `learner_portfolios` tables) and in-memory
  adapters. No migration was needed: both tables and their RLS/triggers already exist.
- **`packages/services/src/PortfolioService.ts`** (new) — `computePortfolioScore(context)`
  computes the real weighted score documented in `PORTFOLIO_ENGINE_ARCHITECTURE.md`:
  - 30% lesson completion percent — completed lesson rows in `user_progress` for the actor,
    over the total module count across every learning path the actor has a progress row in
    (computed the same way `LearningService.getProgress` computes path-level completion,
    but aggregated across paths since a portfolio spans the whole learner, not one path).
  - 30% assessment pass rate percent — from `learning_assessment_results`, mirroring
    `AssessmentService.getLearnerAssessmentSummary`'s read pattern.
  - 30% lab average score percent — from `lab_artifacts`, read tenant-wide with no
    learner filter, deliberately matching `ScenarioService.getLearnerLabSummary`'s existing
    (imperfect but established) scoping rather than silently introducing per-learner
    filtering where the schema has no learner column to filter on.
  - 10% capstone score percent — average of `capstone_projects.portfolioScore` for the
    actor's own capstones, 0 if none exist yet.
  Persists the result to a find-or-create `learner_portfolios` row and to
  `student_twins.portfolioScore` — the component score this workflow owns, following the
  same find-or-create pattern as `LearningService.updateCareerSignal`,
  `AssessmentService.updateCompetencySignal`, and `ScenarioService.updateCareerSignal`.
  `getPortfolio(context)` reads the persisted row back for the dashboard.
- **`packages/services/src/factory.ts`** — added `portfolio: PortfolioService` to
  `ZigServices`, constructed directly from raw repositories (no service-to-service
  injection), consistent with every other entry in `createServices()`.

## Verification performed

- **`npm run build` (root)** — PASS for both `web` and `admin` workspaces.
- **`npm run typecheck` (data-access, services workspaces)** — PASS, zero errors.
- **Unit test added and executed:**
  `packages/services/src/tests/portfolio-workflow.test.ts`. Exercises: an empty learner
  (asserts every one of the four inputs is exactly 0, not null/100, and that a
  `learner_portfolios` row and a `student_twins` row are still persisted at score 0); a
  populated learner (1 of 2 lesson modules completed → 50%, 1 of 1 assessment passed →
  100%, one lab artifact at 80 → 80%, one capstone at 60 → 60%) asserting the exact weighted
  formula (`0.3*50 + 0.3*100 + 0.3*80 + 0.1*60` rounded); persistence (re-reading
  `learner_portfolios` and `student_twins.portfolioScore` reflects the same value, and a
  second `computePortfolioScore` call updates the existing row in place rather than
  creating a duplicate). Run via `npx tsx src/tests/portfolio-workflow.test.ts` from
  `packages/services/` — **exited 0**.
- **Regression check:** all 13 prior workflow tests in `packages/services/src/tests/` and
  both tests in `packages/data-access/src/tests/` were re-run the same way — all
  **exited 0**.

## What is honestly NOT closed in this pass

- **Resume/LinkedIn text generation** (`resumeSummary`/`linkedinSummary` on
  `learner_portfolios`) is not populated by this change — both fields are persisted as
  empty strings. The WAVE 2 request's Resume Engine/LinkedIn Engine is unimplemented.
- **Certification eligibility derivation** (`docs/academy/CERTIFICATION_MODEL.md`) is not
  implemented in this pass. `student_twins.certificationScore` still has no writer.
- **Framework Intelligence Engine, named AI agents (LEO/EVA/FRANK/ISAAC/CAREY/INTERVIEWER),
  and the rest of Career OS** (competency engine, job readiness engine, interview
  preparation) remain unimplemented, per the audit's finding that they either substantially
  overlap with existing functionality or have no committed spec to build against without
  risking duplication of `LearningService`/`AssessmentService`/`ScenarioService`/
  `GovernanceService`/`CoachService`.
- **`apps/web/app/career/page.tsx` still calls `CareerReadinessEngine().score({...})` with
  hardcoded literals** rather than reading the now-real `portfolio_score` from
  `PortfolioService` — flagged in the architecture doc as a "MERGE candidate" but not yet
  wired up in this pass.
