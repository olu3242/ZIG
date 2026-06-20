# Curriculum Inventory

**Date:** 2026-06-20
**Method:** Searched `supabase/seed/`, `packages/data-access`, and `apps/web/app/lib/` for any
persisted or seeded course/lesson/module/assessment content. No code was built or changed to
produce this document.

## Finding: no curriculum content exists anywhere in the repository

- `supabase/seed/001_demo_foundation.sql` (the only seed file that exists) contains **no**
  `learning_paths`, `learning_modules`, `learning_assessments`, or
  `learning_assessment_questions` rows. It seeds governance demo data (org/project/risks/
  controls) only.
- No other seed file, fixture, or JSON/YAML content catalogue exists under `supabase/`,
  `docs/academy/`, or `packages/` for lessons, quiz questions, lab task scripts, or capstone
  briefs.
- `apps/web/app/lib/certificationTracks.ts` explicitly documents this gap in its own comment:
  *"No curriculum-track schema/seed data exists yet... derive one certification track per
  learning path"* — i.e. even the certification layer is a runtime derivation over whatever
  learning paths happen to exist at query time, not a designed curriculum.
- `@zig/learning-marketplace`'s `LearningMarketplace.catalog()` returns 3 hardcoded titles
  ("ISO 27001 Foundations", "Internal Audit Practice Lab", "Certification Capstone Pack") —
  these are **display strings only**, not rows in `learning_paths`/`learning_modules`; no
  `learningPathId` connects them to anything a learner could actually enroll in.
- `@zig/skills-graph`'s `iso27001Core()` returns 5 hardcoded skill nodes — same situation,
  display-only, no table backing.

## What this means for convergence

The Learning OS schema (`learning_paths`, `learning_modules`, `learning_assessments`,
`learning_assessment_questions`) is real, RLS-backed, and has a working write path
(`LearningService.enroll`/`completeLesson`, `AssessmentService.submitAttempt`) — but it is
**empty by default**. Every Learning OS page currently renders an honest empty state for a
fresh tenant (per the project's "zero empty states" rule, each empty state includes a
demo-data/AI-generation entry point) rather than a populated course catalogue.

This is a genuine gap, not a duplication — there is nothing to deduplicate here. It is
recorded in `GAP_ANALYSIS.md` as the top content gap blocking a real end-to-end learner
journey demo.
