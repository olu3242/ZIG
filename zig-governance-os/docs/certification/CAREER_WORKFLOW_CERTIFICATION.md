# Career Readiness Workflow Certification

**Date:** 2026-06-19
**Scope:** Close the Career Readiness workflow — replace `CareerReadinessEngine`'s hardcoded
input literals with a real, persisted `student_twins`-backed rollup, per
`docs/certification/E2E_GAP_REPORT.md` (#9 Career — FAIL: "scores hardcoded literals, no DB
I/O") and `docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md` (#12 Career Progression —
OPEN).

## Module-surface justification (read this first)

`CLAUDE.md` restricts the product to 11 canonical modules and forbids adding a 12th
without a documented, justified gap in `docs/product/prd.md`. That justification was
written first, **before** any code change below: see `docs/product/prd.md` Section 12
("Documented module-surface gap: Career Readiness"). Decision: Career Readiness is **not**
a new top-level module — it is scoped as a **real-data view under Executive Reporting**
(module #11), the same way Executive Reporting already generates a Readiness Report and
Governance Summary from live data rather than a manually compiled document.

## What was hardcoded before

`apps/web/app/career/page.tsx` called
`new CareerReadinessEngine().score({ portfolio: 72, projects: 76, labs: 81, capstones: 69,
interview: 66, skills: 74, certifications: 70 })` — seven literal numbers, never read from
or written to any table. `EmployerMatchingEngine.match()` was then called with that
fabricated number, compounding the fabrication.

## What is real now

### Service layer — `packages/services/src/LearningService.ts` (EXTENDED, not new)

**KEEP/EXTEND/MERGE/REMOVE decision: EXTEND `LearningService`, do not create a
`CareerService`.** `LearningService` already owns `studentTwinRepository` (used by its
existing `updateCareerSignal` private method) — the same row a career rollup must read.
A separate service would either duplicate that repository wiring or just be
`LearningService` under a different name.

Added `getCareerReadiness(context)`:

- Reads the current actor's `student_twins` row (by `learnerUserId`). Returns
  `{ readinessScore: 0, twin: null }` if no row exists yet (e.g. brand-new learner who
  hasn't completed a lesson, assessment, or lab) — an honest empty state, not a fabricated
  score.
- When a row exists, `readinessScore` is the rounded average of five columns that already
  have a confirmed writer or honestly read as `0`: `learningScore` (written by
  `LearningService.completeLesson`), `knowledgeScore` (written by `AssessmentService`),
  `skillsScore` (written by `ScenarioService.scoreAndComplete`), `portfolioScore` and
  `certificationScore` (no writer yet anywhere in the codebase — they read `0` until a
  future Portfolio Engine, already scoped in
  `docs/academy/PORTFOLIO_ENGINE_ARCHITECTURE.md`, writes them).
- `behaviorScore`/`confidenceScore` are deliberately excluded from the rollup, consistent
  with `docs/academy/CAREER_PATH_CROSSWALK.md`'s finding that no plausible data source for
  either exists anywhere in the codebase — inventing one was rejected there and is not done
  here either.

No new repository, no new top-level service key, no `factory.ts` change required —
`getCareerReadiness` is a read against a repository `LearningService` already holds.

## Route — `apps/web/app/career/page.tsx` (rewritten, not new)

- Calls `loadCareer()` (new function in `apps/web/app/lib/data.ts`, following the same
  pattern as `loadVendors`/`loadEvidence`), which calls
  `services.learning.getCareerReadiness(context)`.
- Displays the real `readinessScore`, a "Readiness Inputs" table listing each of the five
  real signal columns (zero state: "No readiness signals recorded yet — portfolioScore and
  certificationScore remain 0 until a future Portfolio Engine writes them"), and passes the
  real `readinessScore` (not a fabricated one) into the existing
  `EmployerMatchingEngine.match()` call — that engine's logic was already a real function of
  its input, it was the input itself that was fake before.
- `EmploymentOS` component listing is unchanged — it is a static list of product
  components, not a score, so it carried no fabrication to begin with.
- No new top-level navigation item, module doc, or top-level service key introduced. The
  existing `/career` route and its nav entry are reused as-is.

## What is honestly NOT fully closed

1. **`portfolioScore`/`certificationScore` have no writer.** They are included in the
   rollup denominator as `0`, which mathematically depresses the readiness score for every
   learner until a Portfolio Engine and a certification-issuance flow exist. This is the
   intended honest behavior, not a bug, but it means the rollup currently caps below 100
   even for a learner who has maxed out every signal that does have a writer
   ((100+100+100+0+0)/5 = 60).
2. **`behaviorScore`/`confidenceScore` are permanently excluded**, not partially modeled —
   there is still no identified data source for either anywhere in the codebase.
3. **No history.** `getCareerReadiness` reads the current `student_twins` row only; there
   is no time-series of readiness over time.
4. **No live Supabase verification.** Verified against `createInMemoryRepositories()` via
   the runtime test below; the Supabase-backed path was typechecked/built successfully but
   not exercised against a real database in this sandbox.

## Verification performed

- **`npm run typecheck` (root)** — PASS, zero errors.
- **`npm run build` (root)** — PASS. `/career` appears in the `web` route manifest.
- **Unit test added and executed:**
  `packages/services/src/tests/career-readiness-workflow.test.ts`, following the
  established self-executing-assertion pattern. Exercises: a brand-new learner with no
  `student_twins` row (asserts `readinessScore: 0`, `twin: null`) → enroll + complete one
  lesson (asserts a persisted twin with `learningScore: 100`, `readinessScore: 20` =
  `(100+0+0+0+0)/5`) → directly raise `knowledgeScore`/`skillsScore` on the twin row (as the
  Assessment/Scenario closures already do in production) and re-read (asserts
  `readinessScore: 48` = `(100+80+60+0+0)/5`, confirming the rollup is a real function of
  persisted inputs, not a constant). Run with
  `npx tsx src/tests/career-readiness-workflow.test.ts` from `packages/services/` —
  **exited 0**.
- **Regression check:** `learning-workflow`, `assessment-workflow`, `lab-workflow`,
  `evidence-workflow`, `vendor-risk-workflow`, `service-layer`, `vertical-slice` tests were
  all re-run the same way and all **exited 0**, confirming this change did not break any
  prior workflow.
