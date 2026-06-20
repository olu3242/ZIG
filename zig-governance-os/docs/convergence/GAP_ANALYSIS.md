# Gap Analysis

**Date:** 2026-06-20

## Content gap (highest priority — blocks any real demo)

No curriculum content exists in any seed file or fixture (`CURRICULUM_INVENTORY.md`). The
schema and write paths for `learning_paths`/`learning_modules`/`learning_assessments` are
real and working, but a brand-new tenant sees zero courses, zero lessons, zero quiz
questions. This is the single biggest gap relative to the "signup → ... → generate
governance program" 20-minute journey in `CLAUDE.md` — the learning side of that journey has
no content to walk through. Recommended fix is a seed/demo-data migration (mirroring
`supabase/seed/001_demo_foundation.sql`'s pattern for governance data), not new code.

## Missing tables / missing real services (concepts named but never built)

These stub packages imply a capability with no backing table and no real service anywhere
in `packages/services`:

| Concept | Stub package implying it | What's missing |
|---|---|---|
| Mock interviews / interview scoring | `learning-memory` (`interview_result` memory kind), `employment` (`mock_interviews` component), `mentorship` (`mock_interviews` feature) | No `interview_questions`/`interview_attempts` table, no `InterviewService`. Named in three different places, built in none. |
| Mentorship sessions/matching | `mentorship`, `mentorship-cloud`, `community-os.mentorMatchScore` | No `mentorship_sessions`/`mentors` table. `community-os`'s match-score formula has no real inputs feeding it from any route today. |
| Job/internship matching against real postings | `employer-matching`, `employment` | `EmployerMatchingEngine.match()` takes a readiness score but no real job posting ever exists to match against — no `job_postings`/`employer_accounts` table. |
| Community features (study groups, discussion boards, leaderboards) | `community`, `community-os`, `cohorts` | No backing table for any of these; all are static feature lists. |
| Learning marketplace (course purchases, licensing) | `learning-marketplace`, `training-marketplace` | No `marketplace_listings`/transactions table; `catalog()` returns 3 hardcoded titles not tied to any real `learning_paths` row. |
| Credentialing beyond certification awards | `credentials` | `certification_awards` table is real and has a writer; `credentials`'s broader "micro-credential"/"skill verification" types have no table. |
| Workforce-level analytics (succession planning, leadership readiness) | `workforce-analytics`, `workforce-development` | No tenant-level aggregation table or service; these are single-learner-table concepts (`student_twins`) extended to an org-wide claim with no rollup query behind it. |

None of these are "duplication" problems — they are legitimate product gaps. Listed here so
that when one of them is greenlit for Phase 13+, the existing stub package's
types/vocabulary can be reused as a starting *interface* shape (not its implementation,
which is a one-line literal stub) for the real service, rather than inventing names from
scratch or accidentally building a second stub alongside the first.

## Process gap (the one that caused the Career OS duplication)

There is no single place that lists "real services and the tables they own" — that
knowledge is implicit, scattered across `factory.ts`, `records.ts`, and each service file's
own comments. Phase 12's Career OS duplication happened because a second package
(`@zig/career-os`) and a second route were added without first checking
`LearningService.getCareerReadiness` already existed. `LEARNING_OS_INVENTORY.md` in this
convergence set is the first attempt at making that knowledge explicit and centralized;
recommend it (or a generated equivalent) be kept current going forward, e.g. referenced from
`CLAUDE.md` alongside the "never implement before documenting" rule.
