# Health Advisor + Milestone Engine Certification (Phase 10)

**Date:** 2026-06-20
**Scope:** Close the gap named in `CLAUDE.md`'s module list (#10, Health Advisor) and in
`docs/architecture/health-advisor-engine.md` (rewritten from stub to full spec as part of
this change): nothing ever wrote to the `recommendations` table, and the five governance
health states had no persisted history — only a live, current-moment value.

## What this closes

`GovernanceService` already computed the 7-input score breakdown and exposed a read-only
`findRecommendations`, but no code path ever called `.create()` on the recommendation
repository, and `governance_scores` (defined in schema since Phase 9) was never written to
either. This phase adds the missing write paths, per
`docs/architecture/health-advisor-engine.md`.

## Code changes

- **`packages/services/src/GovernanceService.ts`**
  - `runHealthAdvisor(context, projectId)` — calls `calculateScore`, generates exactly one
    persisted `Recommendation` per input strictly below 100% using the severity/action/
    framework-reference mapping in the doc's Section 3, returns them sorted by severity
    (critical > high > medium > info). Confidence is fixed at `1.0` for every recommendation
    since each names an exact, countable, just-computed gap.
  - `recordScoreSnapshot(context, projectId)` — persists the live score breakdown as a row
    in `governance_scores`.
  - `getScoreHistory(context, projectId)` — reads those snapshots back in chronological
    order.
- **`packages/types/src/index.ts`** — `GovernanceScore` was rewritten from its original
  4-field shape (`controlsImplemented`, `evidenceCoverage`, `riskTreatment`,
  `assessmentCompletion` — a legacy shape nothing had ever written to, confirmed via a
  repo-wide search before changing it) to the current 7-input shape plus `healthState`,
  matching `GovernanceScoreBreakdown` exactly so a snapshot is a lossless persisted copy of
  the live computation, not a remapped approximation.
- **`supabase/migrations/202606200001_health_advisor_score_snapshots.sql`** (new) — renames
  the 4 legacy `governance_scores` columns to their 7-input equivalents and adds the 3 new
  ones (`ownership_completeness`, `review_completion`, `vendor_assessment_coverage`) plus
  `health_state`. A rename, not a backfill, since the table had zero rows under the old
  shape.
- **`apps/web/app/lib/actions.ts`** — new `runHealthAdvisorAction`, following the existing
  `requireTenantContext` → service call → `audit.recordAction` → `redirect` pattern; runs
  both `runHealthAdvisor` and `recordScoreSnapshot` together so a single user action both
  refreshes recommendations and adds a history point.
- **`apps/web/app/projects/[id]/page.tsx`** — two new sections: "Health Advisor" (a
  `DataTable` of ranked recommendations with a severity badge, action, and framework
  reference, plus a "Run Health Advisor" button) and "Score History" (a `DataTable` of
  persisted snapshots in chronological order). Both render an honest empty state
  (explaining how to populate them) rather than a blank screen.

## Verification performed

- **`npm run typecheck` (root)** — PASS, zero errors.
- **`npm run build` (root)** — PASS for both `web` and `admin` workspaces.
- **Unit test added and executed:**
  `packages/services/src/tests/health-advisor-workflow.test.ts`. Exercises: an empty project
  (asserts exactly 7 recommendations, the three foundational inputs at 0% are `critical`,
  every recommendation's confidence is exactly `1`, and the list is sorted critical-first);
  asserts the recommendations are actually persisted (re-read via `findRecommendations`
  returns the same 7, not just the in-memory return value); a fully-covered project (same
  fixture as the governance-scoring test) generates zero recommendations; two
  `recordScoreSnapshot` calls (one fully-covered, one after adding a second unimplemented
  control) produce two real, chronologically-ordered, non-constant snapshots via
  `getScoreHistory`, with the second snapshot's score strictly lower than the first. Run via
  `npx tsx src/tests/health-advisor-workflow.test.ts` from `packages/services/` —
  **exited 0**.
- **Regression check:** all 12 prior workflow tests in `packages/services/src/tests/`
  (`ai-coach-workflow`, `assessment-workflow`, `career-readiness-workflow`,
  `evidence-workflow`, `exports-workflow`, `governance-scoring-workflow`, `lab-workflow`,
  `learning-workflow`, `mission-control-activity`, `service-layer`, `vendor-risk-workflow`,
  `vertical-slice`) were re-run the same way — all **exited 0**, confirming the
  `GovernanceScore` type rewrite did not break the Phase 9 dashboard/exports work.
  `packages/data-access`'s own test suite (`supabase-adapter`, `tenant-isolation`) was also
  re-run — both **exited 0**.

## What is honestly NOT closed in this pass

- **`runHealthAdvisor` does not deduplicate across repeated runs.** Calling it twice without
  any underlying data change persists two full sets of 7 recommendations rather than
  updating the first set in place — there is no "resolve old recommendations" step. A future
  pass would need to either delete/expire prior recommendations for the project before
  generating new ones, or mark superseded ones, before this is safe to expose as a
  recurring/automatic action rather than a manual button.
- **No cron/scheduled re-run.** Per the architecture doc, this is on-demand only — there is
  no job scheduler in this stack — so a project's recommendations and score history only
  advance when a user visits the project page and clicks "Run Health Advisor."
- **The Supabase migration has not been run against a live Supabase instance in this pass**
  (this build's tests run against the in-memory repository implementation, per the existing
  pattern for every prior phase in this repo); it is written and reviewed but unapplied.
