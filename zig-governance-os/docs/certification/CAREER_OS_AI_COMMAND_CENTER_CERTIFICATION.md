# Career OS (AI Command Center sub-feature) Certification

**Date:** 2026-06-20
**Scope:** Phase 12's Resume Engine, LinkedIn Engine, and AI Career Coach. Per explicit
product decision, Career OS is **not** a 12th module — it is built as a sub-feature of AI
Command Center / Health Advisor (module #9), extending `PortfolioService` and `CoachService`
rather than introducing a `CareerService`/`CareerPlanningService`/`CareerRecommendationService`/
`CompetencyService` or a new Coach framework. See `CAREER_WORKFLOW_CERTIFICATION.md` for the
prior, separate readiness-rollup certification this builds on.

## Duplicate-route cleanup (prerequisite)

Two non-integrated "Career" implementations existed before this phase:

- `apps/web/app/career/page.tsx` — real data, via `loadCareer()` →
  `services.learning.getCareerReadiness`.
- `apps/web/app/learning/career/page.tsx` — a separate `@zig/career-os` package called with
  **hardcoded literal inputs** (`portfolioScore: 78, certificationReadiness: 72, ...`),
  producing an identical score for every tenant — a direct violation of CLAUDE.md's
  explainable-scoring and zero-fake-state invariants.

Resolved by redirecting `/learning/career` to `/career` (`export { default } from
"@/app/career/page"`, the same pattern `/employment` already used to point at `/career`) and
removing the duplicate nav entry from `OSShell.tsx`. The `@zig/career-os` package's fake-input
call site is gone; the package itself is left in place (registered in `package.json`/
`tsconfig.json`/`next.config.ts`) since removing it is unrelated cleanup, not required by this
phase.

## Resume/LinkedIn Engine — `PortfolioService.generateCareerMaterials` (EXTENDED, not new)

**KEEP/EXTEND/MERGE/REMOVE decision: EXTEND `PortfolioService`.** `learner_portfolios.
resumeSummary`/`linkedinSummary` columns have existed since `LEARNING_OS_E2E` but had no
writer — `PortfolioService` already owns the `learnerPortfolioRepository` and the
`capstoneProjectRepository`/`labArtifactRepository` reads `computePortfolioScore` performs, so
this is the natural place for a writer to live, not a new `ResumeService`.

`generateCareerMaterials(context)`:

1. Requires an existing `learner_portfolios` row (throws if `computePortfolioScore` hasn't run
   yet — no fabricated portfolio).
2. Reads the real `capstone_projects` and `lab_artifacts` for the actor, picks the
   highest-scoring capstone.
3. Builds `resumeSummary`/`linkedinSummary` text from the real `portfolioScore`, the real
   capstone title and score, and the real lab artifact count — never a fixed template with no
   data behind it.
4. Persists both fields to the existing `learner_portfolios` row via `update`.

## AI Career Coach — `CoachService.tryGenerateCareerCoachReply` (EXTENDED, not new)

Per the spec's explicit instruction ("Extend existing AI Coach. Do NOT create new Coach
framework"), this is one more fall-through branch in `generateReply`, mirroring
`tryGenerateFrameworkGapReply`/`tryGenerateTrustAdvisorReply` exactly:

- Triggers on career-intent keywords (`career|resume|résumé|linkedin|job|interview|portfolio
  readiness|hire`).
- Reads the same `student_twins` row `LearningService.getCareerReadiness` reads (via the
  `twin` already fetched once per `generateReply` call — no duplicate read) and computes the
  identical five-input average, so the Coach and the `/career` page never disagree.
- Reads the real `learner_portfolios.resumeSummary` (added one new constructor dependency,
  `learnerPortfolioRepository`, wired through `factory.ts`) and quotes it verbatim when
  present; otherwise tells the learner to generate one, rather than inventing text.
- Returns `null` to fall through to the existing risk/control/framework/trust branches when the
  message has no career intent.

## Page — `apps/web/app/career/page.tsx` (extended)

Added a "Resume & LinkedIn" section: displays the persisted `resumeSummary`/`linkedinSummary`
when present, otherwise an honest empty state, plus a form (`generateCareerMaterialsAction`)
that calls `computePortfolioScore` then `generateCareerMaterials` and redirects back —
following the same server-action pattern as `runHealthAdvisorAction`.

## What is honestly NOT fully closed

1. **Interview Engine not implemented.** No table is positioned for mock-interview
   question/attempt data anywhere in the schema; adding one was judged out of scope for this
   pass rather than inventing an unbacked feature.
2. **No manual edit of `resumeSummary`/`linkedinSummary`** before display — regenerating is the
   only correction path.
3. **No live Supabase verification** — see the same caveat in prior certifications.

## Verification performed

- **`npm run typecheck` (root, covers `@zig/data-access` and `@zig/services`)** — PASS.
- **`npm run build --workspace apps/web`** — PASS; `/career` and `/learning/career` both
  appear in the route manifest (the latter now a redirecting re-export).
- **Unit test:** `packages/services/src/tests/career-os-workflow.test.ts` —
  `generateCareerMaterials` throws before a portfolio exists, then produces resume/LinkedIn
  text that references the real top capstone title and persists it; the Coach's career branch
  asserts the no-twin empty state, the readiness-only reply, and the resume-quoting reply in
  sequence. Run via `npx tsx src/tests/career-os-workflow.test.ts` — **exited 0**.
- **Regression check:** all 17 prior workflow test files re-run and **exited 0**.
