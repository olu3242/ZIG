# Certification Eligibility Engine Certification

**Date:** 2026-06-20
**Scope:** Phase 11A — derive certification eligibility, progress, and awards from real
learner performance (`student_twins`, `user_progress`, `learning_modules`,
`capstone_projects`), per `docs/academy/CERTIFICATION_MODEL.md`. No duplication of
`LearningService`, `AssessmentService`, `ScenarioService`, or `PortfolioService` — every
new service reads existing repositories directly and adds no new data path those services
already own.

## What this closes

`docs/academy/CERTIFICATION_MODEL.md` documents eligibility as something that must be
computed at read time, never persisted as a stale flag, and explicitly leaves the
`certification_journeys` table untouched (a separate, unrelated entity out of scope here).
It also anticipates a "concrete need" — such as recording an actual awarded badge — as
legitimate future work justifying one new minimal table. This phase implements exactly
that: live eligibility/progress derivation, plus one new table, `certification_awards`,
to record the point-in-time fact of an award.

## Code changes

- **`supabase/migrations/202606200002_certification_engine.sql`** (new) — creates
  `certification_awards` (tenant-scoped, `learner_user_id`, `certification_key`,
  `badge_key`, `score_snapshot` jsonb, `awarded_at`), with RLS and an `updated_at` trigger
  applied via the standard `do $$ ... loop` block. `certification_journeys` is not touched.
- **`packages/types/src/index.ts`** — added the `CertificationAward` interface.
- **`packages/data-access/src/records.ts`** / **`repositories.ts`** — added
  `CertificationAwardRecord` and registered `certificationAwards` as a `TenantRepository`
  against both the Supabase and in-memory adapters.
- **`packages/services/src/certificationEligibility.ts`** (new) — a shared pure-function
  module, `computeEligibilityBreakdown`, mirroring the existing
  `@zig/progress-engine`/`@zig/completion-engine` pattern (this codebase never composes
  services, so shared derivation logic lives in a plain function, not an injected service).
  Computes four boolean requirements (completion, knowledge, skills, capstone), an
  explainable `missingRequirements[]` list, `completionPercent`, `status`, `eligible`, and
  a `summaryScore`. Thresholds are passed in via `CertificationTrackConfig` per call — no
  hardcoded track registry exists, per the doc's own guidance that thresholds are a
  curriculum-owner decision.
- **`packages/services/src/CertificationEligibilityService.ts`** (new) — owns no table;
  `evaluateEligibility(context, track)` reads modules/progress/twins/capstones and calls
  the shared function.
- **`packages/services/src/CertificationProgressService.ts`** (new) —
  `getProgress(context, track)` adds `estimatedCompletion` and `recommendedNextActions`
  framing on top of the same breakdown.
- **`packages/services/src/CertificationAwardService.ts`** (new) — extends `BaseService`.
  `awardCertification(context, track)` re-derives eligibility itself (never trusts a
  caller-supplied flag), throws if ineligible, and is idempotent
  (find-by-`learnerUserId`+`certificationKey` before create). Writes
  `student_twins.certificationScore` via the same find-or-create pattern used by
  `LearningService.updateCareerSignal` / `PortfolioService.updateCareerSignal`.
  `getAwards(context)` lists the actor's awards.
- **`packages/services/src/factory.ts`** — added `certificationEligibility`,
  `certificationProgress`, `certificationAwards` to `ZigServices`, constructed directly
  from raw repositories, consistent with every other entry.
- **`packages/services/src/index.ts`** — exported the three new services, the shared
  module, and (previously missing) `AssessmentService`/`PortfolioService`/`CoachService`.
- **UI**: `apps/web/app/lib/certificationTracks.ts` derives one `CertificationTrackConfig`
  per existing learning path (no curriculum-track schema exists yet to source this from);
  `apps/web/app/lib/data.ts` adds `loadCertifications()`; `apps/web/app/lib/actions.ts` adds
  `awardCertificationAction`; `apps/web/app/certifications/page.tsx` (new) is the
  Certification Center, showing eligibility/progress/recommended-next-actions/awards per
  track with an award button that disables until eligible; added to the sidebar nav in
  `apps/web/app/OSShell.tsx` under the existing Learning/Policy group.

## Verification performed

- **`npm run typecheck` (data-access, services workspaces)** — PASS, zero errors.
- **`npm run build` (root)** — PASS for `web` and `admin`; `/certifications` route present
  in the build output.
- **Unit test added:** `packages/services/src/tests/certification-engine-workflow.test.ts`.
  Exercises: an empty learner (ineligible, all 4 requirements missing, 0% completion, 4
  recommended actions); awarding while ineligible throws; a fully-qualified learner
  (2/2 lessons completed, knowledgeScore 75, skillsScore 80, one graded capstone at 65)
  is eligible with 0 missing requirements and 100% completion; awarding persists a real
  `certification_awards` row, is idempotent on a second call, and writes a positive
  `certificationScore` to `student_twins`; tenant isolation (a second tenant context sees
  neither the eligibility data nor the award). Run via
  `npx tsx src/tests/certification-engine-workflow.test.ts` — **exited 0**.
- **Regression check:** all 15 workflow tests in `packages/services/src/tests/` and both
  tests in `packages/data-access/src/tests/` re-run — all **exited 0**.

## Success criteria status

| Criterion | Status |
|---|---|
| Typecheck Pass | Met |
| Build Pass | Met |
| Tests Pass | Met |
| Eligibility Operational | Met — live derivation, never a stored flag |
| Awards Operational | Met — idempotent, re-validates eligibility at award time |
| Badges Operational | Met — `badgeKey` persisted on the award record |
| Portfolio Integration Operational | Partially met — `certificationScore` is written to `student_twins`, which `PortfolioService`/career readiness already read; no new coupling was added in the other direction |

## What is honestly NOT closed in this pass

- **No curriculum-track catalogue exists.** Tracks are derived 1:1 from learning paths with
  default thresholds (70/70/60, capstone required) rather than from a real
  product-authored registry — there is no schema or seed data for that yet.
- **Badge display/issuance beyond the `badgeKey` string** (e.g. an image asset, a public
  verification page) is out of scope — only the key is persisted.
- **Phase 11B (Framework Intelligence)** is a separate, unrelated piece of work and is not
  addressed by this document.
