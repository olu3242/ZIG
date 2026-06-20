# Learning OS Content — Wave 1

Real curriculum content for the existing `learning_paths` / `learning_modules` tables
(`packages/services/src/LearningService.ts`). No new tables, no new routes, no new
services — this closes the content gap that left those tables empty.

## Why this wave

`LearningService` and `/career`, `/learning`, and the AI Coach's learning branch all read
from `learning_paths` and `learning_modules`, but no seed file ever populated them — every
learner-facing screen backed by these tables had nothing real to show. This wave seeds three
learning paths, one per framework already present in `supabase/seed/001_demo_foundation.sql`
(ISO 27001, SOC 2, NIST CSF), so the existing real code path has real content instead of an
empty state.

## Content set

Each learning path maps 1:1 to a seeded framework and contains modules covering that
framework's core domains, ordered to build from concept to applied practice
(lesson → lab → exercise), matching the `LearningModule.moduleType` union
(`"lesson" | "lab" | "exercise"`).

### ISO 27001 — Information Security Management Foundations

| Module | Type | Duration |
|---|---|---|
| ISMS Scope, Context, and Leadership (Clauses 4–5) | lesson | 35 min |
| Risk Assessment and Statement of Applicability | lesson | 40 min |
| Mapping Annex A Controls to Real Assets | lab | 60 min |
| Internal Audit Program Design | lesson | 30 min |
| Build a Statement of Applicability for a Sample Org | exercise | 50 min |

### SOC 2 — Trust Services Criteria in Practice

| Module | Type | Duration |
|---|---|---|
| The Five Trust Services Criteria | lesson | 25 min |
| Designing Controls for the Security Criterion | lesson | 35 min |
| Evidence Collection for a Type II Audit | lab | 55 min |
| Common Auditor Exceptions and How to Prevent Them | lesson | 30 min |
| Draft a Readiness Assessment for a SaaS Company | exercise | 45 min |

### NIST CSF 2.0 — Cybersecurity Outcomes for Governance Programs

| Module | Type | Duration |
|---|---|---|
| The Six CSF Functions: Govern, Identify, Protect, Detect, Respond, Recover | lesson | 30 min |
| Building a Current Profile vs. Target Profile | lab | 50 min |
| Prioritizing Gaps by Risk and Cost | lesson | 30 min |
| Tier Selection and Maturity Scoring | lesson | 25 min |
| Produce a Target Profile Roadmap for a Mid-Size Org | exercise | 50 min |

## What this wave does not include

- No question-bank/quiz-answer content — `learning_modules` and `assessments` have no
  schema for individual quiz questions; that is a schema gap, not addressed here (it would
  require a new table and is out of scope for a content-only wave).
- No lesson body text/markdown — `LearningModule` has no content-body field in
  `packages/types/src/index.ts`; only title, type, and duration. Lesson content authoring
  beyond titles is gated on that schema decision, not made here.
- No changes to `learning_assessments` / `learning_assessment_results` (added in
  `202606180007_learning_os_e2e.sql`) — those tables have no consuming service yet, so
  seeding them now would be content with no code path to read it.

## Seed file

`supabase/seed/002_learning_content_wave_1.sql` — additive, tenant-scoped to the same demo
tenant as `001_demo_foundation.sql`, uses `on conflict do nothing` so it is safe to re-run.
