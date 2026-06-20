# Duplication Report

**Date:** 2026-06-20

## Resolved duplication (Phase 12)

**Career readiness had three non-integrated implementations** before Phase 12:

1. `LearningService.getCareerReadiness` + `apps/web/app/career/page.tsx` — real, reads the
   actual `student_twins` row (`learningScore`, `knowledgeScore`, `skillsScore`,
   `portfolioScore`, `certificationScore`).
2. `@zig/career-os`'s `CareerOS.readiness()` + `apps/web/app/learning/career/page.tsx` —
   called with **hardcoded literal inputs** (`portfolioScore: 78, certificationReadiness: 72,
   interviewReadiness: 68, practicalExperience: 81`), producing an identical score for every
   tenant regardless of real data. This was a direct violation of `CLAUDE.md`'s explainable-
   scoring and zero-fake-state invariants.
3. `@zig/career-readiness`'s `CareerReadinessEngine.score()` — built, typed, **never called
   from any route**, a third independent formula over a third independent input shape
   (7 fields, none matching either of the above two).

**Fix applied:** `apps/web/app/learning/career/page.tsx` now re-exports
`apps/web/app/career/page.tsx` (`export { default } from "@/app/career/page"`), the same
pattern already used by `apps/web/app/employment/page.tsx`. The duplicate nav entry in
`OSShell.tsx` was removed. `@zig/career-readiness` remains orphaned (zero callers) — see
`COMPONENT_REUSE_MATRIX.md`'s DEPRECATE recommendation.

## Duplication risk still present (not yet a bug, but a converging-name collision)

**"Lab" and "Simulation" are the same table set under two different conceptual names.**
`ScenarioService` owns both: scenario/run records (the "simulation") and lab task/artifact
records (the "lab exercise within the simulation"). Today this is one class, one set of
tables, internally coherent — not a bug. But the requested target architecture names
**Lab OS** and **Simulation OS** as two separate top-level "OS"es. If two separate services
or schemas get built for them independently (e.g., a new `LabService` is created without
first checking that `ScenarioService.completeTask`/`scoreAndComplete` already cover this),
that would immediately reintroduce a Career-OS-style duplication. **Recommendation:** do not
split `ScenarioService` into two services; if a product reason requires Lab OS and
Simulation OS to be presented as separate surfaces, do it at the page/composition layer only
(two routes/components reading the same service), exactly as `loadCareer()` composes
multiple services today.

## Near-miss naming collisions checked and found NOT duplicative

These pairs/sets have overlapping names but distinct, non-overlapping responsibilities — no
action needed:

- `CertificationEligibilityService` vs. `CertificationProgressService` vs.
  `CertificationAwardService` — eligibility check, progress readout, and award-issuance side
  effect respectively. Three real, narrow responsibilities, not a 3x duplication.
- `employment` (`EmploymentOS`, static component list) vs. `employer-matching`
  (`EmployerMatchingEngine`, takes real readiness as input) vs. `employer-cloud`
  (`EmployerCloud`, static feature list for a *different* page, `app/employers`) — three
  distinct decorative packages serving three distinct routes, none competing to own the same
  data.
- `community` vs. `community-os` vs. `cohorts` — `community` has zero callers (dead),
  `community-os` is the one actually wired to `app/learning/community/page.tsx`, `cohorts`
  has zero callers. Not three live competing implementations — only one is live.

## No schema-level duplication found

`packages/data-access/src/records.ts` defines exactly one table per concept relevant to
Learning/Career/Certification/Portfolio (see `LEARNING_OS_INVENTORY.md`'s table list) — no
two tables were found modeling the same entity under different names.
