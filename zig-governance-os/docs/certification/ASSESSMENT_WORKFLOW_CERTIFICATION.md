# Assessment Workflow Certification

**Date:** 2026-06-19
**Scope:** Close the Assessment workflow end-to-end (launch assessment → answer questions →
submit → score → persist → dashboard update → career/competency signal update), per
`docs/certification/E2E_GAP_REPORT.md` (Assessments: PARTIAL) and
`docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md` (#5 Assessment Completion: OPEN).
Follows the exact pattern used to close Learning
(`docs/certification/LEARNING_WORKFLOW_CERTIFICATION.md`).

This document is evidence-backed: every claim cites the file and the actual insert/update
call. No claim of closure is made for anything not actually wired to a real read/write
through the repository layer.

## Schema

**New migration:** `supabase/migrations/202606180012_assessment_questions_e2e.sql`

Checked first: `learning_assessments` and `learning_assessment_results`
(`supabase/migrations/202606180007_learning_os_e2e.sql`, read directly, not assumed) store
only:
- `learning_assessments`: `id`, `tenant_id`, `assessment_type`, `title`, `passing_score`,
  audit columns.
- `learning_assessment_results`: `id`, `tenant_id`, `assessment_id`, `learner_user_id`,
  `score`, `passed`, `remediation_skill_ids`, audit columns.

Neither stores individual questions, options, or correct answers — there was no way to
score a real submitted answer set against anything. A grep across every migration in
`supabase/migrations/` for "question" returned no hits, confirming no
`assessment_questions`-style table existed anywhere else in the schema (e.g. not in the
vendor/audit/risk migrations either). A new table was required, not optional.

Creates `learning_assessment_questions`:
- `id`, `tenant_id`, `assessment_id` (FK to `learning_assessments`), `prompt`,
  `options` (`jsonb` array of option strings), `correct_option_index`, `weight`,
  `order_index`, audit columns.
- RLS enabled and `updated_at` trigger wired using the exact same `do $$ ... $$` loop
  pattern copied from `202606180007_learning_os_e2e.sql` and
  `202606180011_learning_progress_e2e.sql` — no new RLS pattern was invented.
- `learning_assessment_questions_assessment_idx` added on `assessment_id` since every
  scoring read filters by it.

No existing migration was modified. `learning_assessments` / `learning_assessment_results`
are reused as-is.

## Types / data-access layer

- `packages/types/src/index.ts`: added `LearningAssessment`, `LearningAssessmentQuestion`,
  `LearningAssessmentResult` interfaces. (The pre-existing `Assessment` interface — a
  different, lighter-weight type used by the generic `assessments` repository/table for
  framework-readiness assessments — was left untouched; it is a distinct entity from
  `learning_assessments` and conflating them would have broken the existing `assessments`
  repository registration.)
- `packages/data-access/src/records.ts`: added `LearningAssessmentRecord`,
  `LearningAssessmentQuestionRecord`, `LearningAssessmentResultRecord` (same
  `& { createdAt; updatedAt }` pattern as every other record type in this file).
- `packages/data-access/src/repositories.ts`: added `learningAssessments`,
  `learningAssessmentQuestions`, `learningAssessmentResults` to `ZigRepositories`, and
  registered all three in both `createSupabaseRepositories()` (table names
  `learning_assessments`, `learning_assessment_questions`, `learning_assessment_results`)
  and `createInMemoryRepositories()`. Each is a `TenantRepository<T>` wrapping a
  `SupabaseRestAdapter<T>` / `InMemoryDatabaseAdapter<T>` with the shared `AuditSink`,
  identical in shape to every other repository registration in this file.

**Why these needed adding:** the gap report noted "the generic `assessments` repository can
write" but that repository is bound to the unrelated `assessments` table (framework
readiness), not `learning_assessments`. `learning_assessments` /
`learning_assessment_results` had migrations but, like `student_twins` before the Learning
fix, zero repository registration anywhere — this is the first real read/write path into
them.

## Service layer — `packages/services/src/AssessmentService.ts` (new)

Checked first for something to extend: no `AssessmentService` exists anywhere in
`packages/services/src`, and the only "scoring" code in the repo,
`packages/assessment-os/src/index.ts` `AssessmentOS.composite()`, averages five
caller-supplied numbers with no DB I/O — it is not extendable into a real scoring path
without rewriting it entirely, and the task brief explicitly calls out that this function
should be replaced rather than reused. A new service class was justified (same class of
decision as `@zig/progress-engine`/`@zig/completion-engine` in the Learning fix).

`AssessmentService extends BaseService<LearningAssessmentRecord>`, giving it the inherited
CRUD (`create`/`update`/`delete`/`findById`/`findMany`/`search`) plus:

- **`findAssessment(context, assessmentId)`** — reads the real `learning_assessments` row
  and its real `learning_assessment_questions` rows (sorted by `order_index`). Returns
  `null` if the assessment doesn't exist. Real reads, no synthetic data.
- **`submitAttempt(context, assessmentId, answers)`** — the core scoring logic:
  1. Loads the real assessment and its real question set.
  2. For each question, checks the learner's submitted `selectedOptionIndex` against the
     question's real `correctOptionIndex`. Unanswered or wrong answers earn zero weight for
     that question and are added to a remediation list (the question's own id, since this
     schema has no skill-tagging on questions yet — see honesty note below).
  3. `score = round((earnedWeight / totalWeight) * 100)`, `passed = score >= assessment.passingScore`.
     This is a real function of the submitted answers — not `AssessmentOS.composite()`,
     not a fixed number.
  4. Persists a real `learning_assessment_results` row via
     `this.resultRepository.create(...)`.
  5. Calls `updateCompetencySignal()`, which does a real find-or-create
     `this.studentTwinRepository.update/create(...)` writing `knowledgeScore` — the
     student_twins component score this workflow owns (Learning already owns
     `learningScore`/`careerScore`; this does not double-write those).
  6. Returns `{ result, score, passed, remediationSkillIds }`.
- **`getLearnerAssessmentSummary(context)`** — reads all of the actor's
  `learning_assessment_results` rows and computes `attemptCount`, `passedCount`, and
  `latestScore` directly from the data (used by both the Learning page's "Assessment
  Signal" section and the dashboard).

`packages/services/src/factory.ts` updated to construct
`new AssessmentService(repositories.learningAssessments, repositories.learningAssessmentQuestions, repositories.learningAssessmentResults, repositories.studentTwins)`
and expose it as `services.assessments`.

## Routes — `apps/web/app/assessment/`

Checked first: `find apps/web/app/assessment` returned nothing before this change — no
assessment routes existed anywhere in `apps/web/app`. Both are new:

- **`apps/web/app/assessment/page.tsx`** (new) — assessment list. Calls
  `services.assessments.findMany` and `.getLearnerAssessmentSummary`. Renders attempt/pass
  stats and a table of assessments with a "Launch assessment" link per row.
- **`apps/web/app/assessment/[id]/page.tsx`** (new) — assessment detail / launch / submit.
  Calls `services.assessments.findAssessment`. If the assessment has no questions, shows an
  honest empty state instead of pretending a submission is possible. If it has questions,
  renders a real `<form action={submitAssessmentAction}>` with one `<fieldset>` of radio
  options per question, posting `questionId` (repeated) and `answer_{questionId}` fields.

### Fixed call site — `apps/web/app/learning/page.tsx`

The audit specifically flagged this file calling
`new AssessmentEngine().grade("practical_exam", 72, ["control-mapping"])` — hardcoded score
input, never touching a real submission. This call (and the now-unused `AssessmentEngine`
import) was removed. The "Assessment Signal" section now renders
`services.assessments.getLearnerAssessmentSummary(context)` — real attempt/pass/latest-score
numbers from `learning_assessment_results` — plus a link into the new Assessment Center.
This is the only change to this file beyond what Learning's certification already made;
all of the file's other existing content (skills graph, adaptive recommendations, learning
paths list) was left untouched per the "kept, not removed" precedent set by the Learning
fix.

## Server action — `apps/web/app/lib/actions.ts`

Added **`submitAssessmentAction(formData)`**, following the exact pattern of
`completeLessonAction` (require tenant context, call a service method, record an audit
event with the computed result in the reason string, redirect):

- Reads `assessmentId` and the repeated `questionId` fields, pairs each with its
  `answer_{questionId}` value (parsed as an integer; missing answers become `-1`, which
  never matches a real `correctOptionIndex`, so blank/incomplete submissions cannot
  accidentally score as correct).
- Calls `services.assessments.submitAttempt(context, assessmentId, answers)`.
- Records a `complete` audit event on `learning_assessment_results` including the score and
  pass/fail in the reason string.
- Redirects to `/assessment/{assessmentId}?score=...&passed=...` so the detail page can show
  the just-submitted outcome.

## Career/competency signal — real DB write, not a TODO

`AssessmentService.submitAttempt` always ends by calling `updateCompetencySignal`, which
does:
```ts
await this.studentTwinRepository.update(context, twin.id, { knowledgeScore: score });
// or, if no twin exists yet:
await this.studentTwinRepository.create(context, { ...zeros, knowledgeScore: score });
```
This is a real PATCH/POST to Supabase's `student_twins` table via `SupabaseRestAdapter`,
scoped by `tenant_id`, identical in mechanism to how `LearningService.updateCareerSignal`
writes `learningScore`/`careerScore`. The two services write disjoint columns
(`knowledgeScore` here, `learningScore`/`careerScore` there) so neither overwrites the
other's signal when both workflows have been exercised for the same learner.

## Dashboard

`apps/web/app/lib/data.ts` `loadDashboard()` — added a real
`services.assessments.getLearnerAssessmentSummary(context)` call alongside the existing
tenant/projects/frameworks/learning queries, surfaced as `stats.assessmentAttemptCount` and
`stats.assessmentPassedCount`.

`apps/web/app/dashboard/page.tsx` — extended the existing Learning stat row (was
`md:grid-cols-2`, now `md:grid-cols-2 xl:grid-cols-4`) with two new `StatCard`s:
"Assessment Attempts" and "Assessments Passed", both reading the new real numbers.

## Harmonization notes (KEEP / EXTEND / MERGE / REMOVE)

- **NEW** `AssessmentService` — checked first that none existed; the only related code
  (`AssessmentOS.composite()`) is a hardcoded-average stub with no DB I/O and was not
  extendable into a real scoring path. Justified as net-new, same class of decision as
  Learning's `@zig/progress-engine`/`@zig/completion-engine`.
- **NEW** `learning_assessment_questions` table and its repository — checked first
  (migration read directly, full grep for "question" across `supabase/migrations/`); no
  equivalent existed anywhere. Required at the schema level, not just the service level.
- **EXTEND, not duplicate**, `learning_assessments` / `learning_assessment_results` — no new
  assessment-definition or result tables were created; only the missing
  question/answer-content table was added.
- **KEEP** the pre-existing `Assessment` type / `assessments` repository / `AssessmentRecord`
  — this is a distinct entity (framework-readiness assessments tied to projects, not
  learning quizzes) and was not touched or merged with the new
  `LearningAssessment`/`LearningAssessmentResult` types, to avoid conflating two different
  concepts that happen to share a similar English name.
- **REMOVE** the `AssessmentEngine().grade("practical_exam", 72, [...])` call site in
  `apps/web/app/learning/page.tsx` — replaced with a real summary call, per the audit's
  specific finding. The `AssessmentEngine`/`@zig/assessment-engine` package itself was left
  in place (not deleted) since deleting a whole package was out of scope and nothing else in
  this change depends on removing it; it is simply no longer imported from this file.
- **EXTEND** `apps/web/app/lib/data.ts` `loadDashboard()` and
  `apps/web/app/dashboard/page.tsx` rather than create new dashboard files, matching exactly
  how the Learning stats were added.
- No existing file was deleted. No 12th product module was introduced — Assessments is
  treated as part of the existing Learning surface, consistent with how the schema groups
  `learning_assessments` alongside `learning_paths`/`learning_modules` in the same migration
  file.

## What is honestly NOT fully closed

1. **No question-authoring UI.** Questions must currently be inserted directly into
   `learning_assessment_questions` (e.g. via Supabase or a seed script) — there is no admin
   route to create an assessment or its questions. The brief asked to close the
   launch→answer→submit→score→persist→dashboard→career chain for an existing assessment, not
   to build assessment authoring tooling, so this was treated as out of scope. The detail
   page (`apps/web/app/assessment/[id]/page.tsx`) explicitly shows "no questions defined" as
   a clean empty state rather than crashing or faking question data.
2. **Remediation targets are question ids, not skill ids.** `learning_assessment_results`
   has a `remediation_skill_ids` column (array of uuids), inherited from the original
   migration's intent to link wrong answers back to `skill_nodes`. The new
   `learning_assessment_questions` table does not have a `skill_node_id` column — adding one
   and wiring a join to `skill_nodes`/`adaptive_learning_recommendations` would be a
   reasonable next step, but was not requested and would have meant touching the adaptive
   learning surface, which is adjacent to but distinct from this task's scope. Today,
   `remediationSkillIds` on the returned result is actually a list of missed *question* ids
   — functionally usable (a future UI can show "review these questions"), but not literally
   "skill" ids as the column name implies. This is a pre-existing naming mismatch in the
   schema, not something introduced by this change.
3. **No retake limit / cooldown / question randomization.** Every `submitAttempt` call
   creates a new `learning_assessment_results` row; there is no check preventing unlimited
   resubmission, and the same question order/options are shown every time. Not requested,
   not implemented.
4. **Single-tenant assessment authoring assumed.** Like Learning, this only updates one
   `student_twins` component (`knowledgeScore`) and intentionally leaves the other seven
   components untouched on existing rows. A full Career Engine aggregation remains
   explicitly out of scope (Phase 7).
5. **No live Supabase verification.** As with the Learning certification, all claims above
   are verified against the in-memory repository implementation
   (`createInMemoryRepositories()`) via the runtime test described below, not against a live
   Supabase project. The Supabase-backed code path
   (`createSupabaseRepositories()`/`SupabaseRestAdapter`) was registered with the exact same
   shape as every other working repository in this file and was typechecked, but not
   exercised against a real database in this sandbox.
6. **E2E browser test not added.** No Playwright spec was authored for this workflow (the
   Learning certification's Playwright spec is also unexecuted in this sandbox for the same
   reason — no live Supabase/seeded test user). This was judged lower priority than the
   runtime-executed unit test, which is the verification method actually exercised in this
   change.

## Verification performed

- `npm run typecheck` (root) — **PASS**. `@zig/data-access` and `@zig/services` both clean
  (`tsc -p tsconfig.json --noEmit` for both workspaces, zero errors).
- `npm run build` (root) — **PASS**. Both `web` and `admin` Next.js builds succeeded. The
  `web` build's route manifest includes the new `/assessment` and `/assessment/[id]` routes
  alongside all pre-existing routes.
- **Unit test added and executed:**
  `packages/services/src/tests/assessment-workflow.test.ts`, following the exact
  self-executing-assertion pattern used by `service-layer.test.ts` and
  `learning-workflow.test.ts` in the same directory. It exercises the full in-memory flow:
  create an assessment + two questions → load via `findAssessment` (asserts 2 questions
  returned) → submit a failing attempt (1/2 correct, asserts score=50, passed=false,
  remediation list contains the missed question, a `learning_assessment_results` row
  persists with score 50, and `student_twins.knowledgeScore` becomes 50) → submit a passing
  attempt (2/2 correct, asserts score=100, passed=true, `knowledgeScore` updates to 100 on
  the same twin row) → `getLearnerAssessmentSummary` reports `attemptCount: 2`,
  `passedCount: 1`, `latestScore: 100` → submit a blank attempt (no answers) and assert it
  scores 0%, not silently passing. Run directly with
  `npx tsx src/tests/assessment-workflow.test.ts` from `packages/services/` — **exited 0**.
  The two pre-existing test files (`service-layer.test.ts`, `learning-workflow.test.ts`) were
  re-run the same way as a regression check and both still exit 0.
