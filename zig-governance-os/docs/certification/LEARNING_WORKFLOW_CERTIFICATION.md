# Learning Workflow Certification

**Date:** 2026-06-19
**Scope:** Close the Learning workflow end-to-end (enroll → open module → open lesson → complete lesson → progress persists → dashboard reflects it → career-readiness signal updates), per `docs/certification/E2E_GAP_REPORT.md` (Learning: PARTIAL) and `docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md` (#3 Learning Enrollment, #4 Lesson Completion: OPEN).

This document is evidence-backed: every claim below cites the file and the actual insert/update call. No claim of PASS is made for anything not actually wired to a real Supabase write.

## Schema

**New migration:** `supabase/migrations/202606180011_learning_progress_e2e.sql`

Creates `user_progress`:
- `tenant_id`, `user_id`, `learning_path_id`, `module_id`, `lesson_id`, `status` (`enrolled` | `in_progress` | `completed`), `completed_at`, `created_at`, `updated_at`.
- RLS enabled with the same pattern as every other table in this migration set (copied exactly from `risks`/`learning_paths` in `202606180001_batch_21_core_data_platform.sql` and the `do $$ ... $$` loop style from `202606180007_learning_os_e2e.sql`):
  ```sql
  alter table user_progress enable row level security;
  create policy user_progress_tenant_access on user_progress
    using (tenant_id = current_tenant_id())
    with check (tenant_id = current_tenant_id());
  ```
- `updated_at` trigger via the existing `set_updated_at()` function, same as every other table.

No existing migration was modified. `learning_paths` and `learning_modules` (defined in `202606180001_batch_21_core_data_platform.sql`, lines 240–258) and `student_twins` (defined in `202606180008_learning_agent_workforce.sql`) were reused as-is — they already had the right shape for this workflow.

## Types / data-access layer

- `packages/types/src/index.ts`: added `UserProgressStatus`, `UserProgress`, and `StudentTwin` interfaces.
- `packages/data-access/src/records.ts`: added `UserProgressRecord` and `StudentTwinRecord` (same `& { createdAt; updatedAt }` pattern as `RiskRecord`, `LearningPathRecord`, etc.).
- `packages/data-access/src/repositories.ts`: added `userProgress` and `studentTwins` to `ZigRepositories`, and registered both in `createSupabaseRepositories()` (table names `user_progress`, `student_twins`) and `createInMemoryRepositories()`. This follows exactly the existing pattern used for `risks`/`riskAssessments` — a `TenantRepository<T>` wrapping a `SupabaseRestAdapter<T>` (or `InMemoryDatabaseAdapter<T>` for tests), with the shared `AuditSink` so every write is also audit-logged.

**Why `studentTwins` needed adding:** `student_twins` had a migration (`202606180008`) but no repository registration anywhere — it was schema-only, unused by any service, exactly as the gap report noted ("Tables exist ... but nothing writes to or reads from them in service code"). This change is the first real write path into it.

## Service layer — `packages/services/src/LearningService.ts`

Added three real methods, all delegating writes to the repository layer (mirrors `RiskService`'s pattern of calling `this.repository.create/update` rather than touching Supabase directly):

- **`enroll(context, learningPathId)`** — checks for an existing path-level `user_progress` row (idempotent), otherwise calls `this.userProgressRepository.create(...)` with `status: "enrolled"`. Real insert.
- **`completeLesson(context, lessonId)`** — looks up the lesson via `this.moduleRepository.findById`, finds or creates the per-lesson `user_progress` row and calls `this.userProgressRepository.update(...)` or `.create(...)` with `status: "completed"`, `completedAt: new Date()`. Real insert/update. Then recomputes the path's full module set and progress rows, derives a learning/career signal via `CompletionEngine`, and calls the private `updateCareerSignal()`, which does a real `this.studentTwinRepository.update(...)` (or `.create(...)` if no twin row exists yet) writing `learningScore` and `careerScore` onto `student_twins`.
- **`getProgress(context, learningPathId)`** — reads real `learning_modules` and `user_progress` rows and passes them to `ProgressEngine.computePathCompletion()` to return `{ totalModules, completedModules, completionPercent, status }`. No hardcoded percentage.
- **`getLearnerSummary(context)`** — added for the dashboard; reads all of the actor's `user_progress` rows and computes `enrolledPathCount` (distinct `learningPathId`s) and `completedLessonCount` (rows with `status === "completed" && lessonId`) directly from the data, not a placeholder.
- **`findModuleById(context, moduleId)`** — thin passthrough to the module repository, needed by the new module/lesson detail pages.

`packages/services/src/factory.ts` updated to inject `repositories.userProgress` and `repositories.studentTwins` into the `LearningService` constructor.

## progress-engine and completion-engine

Both are new minimal real packages (not hardcoded-average stubs like `packages/career-readiness`):

- **`packages/progress-engine/src/index.ts`** — `ProgressEngine.computePathCompletion(totalModuleIds, progressRows)` is a pure function that takes the real module-id list and the learner's real progress rows and computes `completedModules`, `completionPercent = round(completed/total*100)`, and an overall path `status`. No DB I/O of its own by design — persistence stays solely in `packages/data-access`, consistent with how the rest of this codebase separates "computation" packages (e.g. `@zig/framework-engine`) from the data-access layer.
- **`packages/completion-engine/src/index.ts`** — `CompletionEngine.deriveLearningSignal(input)` calls `ProgressEngine` internally and derives `{ learningScore, careerScore }` where `careerScore = round(learningScore * 0.7)`. The 0.7 weighting is documented in-code as an explicit, real function of completion ratio — not an arbitrary fixed score. It is honestly scoped: it only models the *learning* contribution to career readiness; portfolio/certification/behavior inputs to `student_twins` are intentionally left untouched (still 0) because building those is out of scope for this task (Phase 7 / full Career Engine rebuild was explicitly excluded).

Both packages were registered as workspace packages (`package.json` + `tsconfig.json` matching the existing `@zig/career-readiness` boilerplate exactly) and added as dependencies of `@zig/services` (`packages/services/package.json`, `packages/services/tsconfig.json` path mapping).

## Routes — `apps/web/app/learning/`

Checked first: no `[id]`, `module/[id]`, or `lesson/[id]` routes existed before this change (confirmed via `find apps/web/app/learning -type f`). All three are new:

- **`apps/web/app/learning/[id]/page.tsx`** (new) — learning path detail. Calls `services.learning.findById`, `.findModules`, `.getProgress`. Renders an "Enroll in this path" form (calls `enrollAction`) when the learner has no progress row yet, and a module table with "Open lesson"/"Open module" links.
- **`apps/web/app/learning/module/[id]/page.tsx`** (new) — module detail. Calls `services.learning.findModuleById` and `.findById` (for the parent path), links back to the path and forward to the lesson if the module is a lesson.
- **`apps/web/app/learning/lesson/[id]/page.tsx`** (new) — lesson detail. Calls `services.learning.findModuleById`, `.findById`, `.getProgress`, and renders the "Complete Lesson" form (calls `completeLessonAction`).
- **`apps/web/app/learning/page.tsx`** (modified, KEEP/EXTEND) — kept all existing read-only Learning OS content (skills graph, adaptive recommendations, etc. — explicitly out of scope to remove since they're not claimed as broken in the gap report and removing them wasn't requested). Added an "Open path" link on each learning-path card pointing at the new `/learning/[id]` route. This is the only change to this file.

## Server actions — `apps/web/app/lib/actions.ts`

Added, following the exact pattern of `createProjectAction` (require tenant context, call a service method, record an audit action, redirect):

- **`enrollAction(formData)`** — reads `learningPathId`, calls `services.learning.enroll(context, learningPathId)`, records a `create` audit event on `user_progress`, redirects to `/learning/{id}`.
- **`completeLessonAction(formData)`** — reads `lessonId` and `learningPathId`, calls `services.learning.completeLesson(context, lessonId)`, records a `complete` audit event (including the computed learning/career score in the reason string), redirects to `/learning/{learningPathId}`.

## Career signal — real DB write, not a TODO

`LearningService.completeLesson` always ends by calling `updateCareerSignal`, which does:
```ts
await this.studentTwinRepository.update(context, twin.id, { learningScore, careerScore });
// or, if no twin exists yet:
await this.studentTwinRepository.create(context, { ...zeros, careerScore, learningScore });
```
This is a real PATCH/POST to Supabase's `student_twins` table via `SupabaseRestAdapter`, scoped by `tenant_id` exactly like every other write in this codebase. `careerScore`/`learningScore` are computed from actual `user_progress` completion ratios, not fixed numbers.

**Honesty note:** this only updates `learning_score` and `career_score` on `student_twins`. The other seven component scores (`knowledge_score`, `skills_score`, `competency_score`, `portfolio_score`, `certification_score`, `behavior_score`, `confidence_score`) are left at 0 for new rows and untouched on existing rows — a full Career Engine that aggregates all nine signals into a single readiness number is explicitly out of scope per the task brief (Phase 7). What this closes is exactly what was asked: "a real DB write a future career engine can read," which it is.

**Certification eligibility flag:** the brief mentions "certification eligibility flag updates." There is no certification-eligibility column on any existing table (the closest is `certification_journeys.readiness_score`/`status` in `202606180008`, which is a separate, unrelated entity this task was told not to touch — Assessments/Labs/Vendor/AI Coach/Reports/Milestones are explicitly out of scope, and `certification_journeys` belongs to that adjacent, out-of-scope surface). The signal this task does write — `student_twins.learning_score`/`career_score` — is the real, in-scope analog: it is the field a future career/certification engine would read to derive eligibility. No new flag was invented to avoid scope creep into the explicitly excluded Phase 7 work.

## Dashboard

`apps/web/app/lib/data.ts` `loadDashboard()` — added a real `services.learning.getLearnerSummary(context)` call alongside the existing tenant/projects/frameworks queries, surfaced as `stats.enrolledPathCount` and `stats.completedLessonCount`.

`apps/web/app/dashboard/page.tsx` — added a new stat row rendering `Learning Paths Enrolled` and `Lessons Completed` from those real numbers. There was no prior placeholder learning text on this page to replace (the dashboard's only hardcoded value, `governanceScore: latestProject ? 25 : 0`, is a separate, pre-existing issue out of scope for this task).

## Harmonization notes (KEEP / EXTEND / MERGE / REMOVE)

- **KEEP** `apps/web/app/learning/page.tsx`'s existing skills-graph/adaptive-recommendation/assessment-signal sections — they are read-only demo presentation, not part of this workflow's required chain, and removing them was not requested.
- **EXTEND** `LearningService` rather than create a new service — `enroll`/`completeLesson`/`getProgress`/`getLearnerSummary`/`findModuleById` were added directly to the existing class, matching how `RiskService` already mixes simple reads (`findAssessments`) with the base CRUD it inherits.
- **EXTEND**, not duplicate, the `learning_paths`/`learning_modules` schema — no new path/module tables were created; only the missing `user_progress` join table was added.
- **NEW (not MERGE)** `studentTwins` repository — `student_twins` had a table but zero repository/service wiring anywhere; this had to be added net-new rather than extended.
- **NEW** `@zig/progress-engine` and `@zig/completion-engine` packages — checked first that neither existed (`packages/progress-engine`, `packages/completion-engine` were absent before this change) and that no existing package (e.g. `@zig/learning-analytics`, `@zig/adaptive-learning`) already did real DB-row-based completion math — they don't; they're stubs operating on caller-supplied fake numbers, same class of issue as `@zig/career-readiness`. New packages were justified.
- No existing file was deleted. No 12th product module was introduced — this closes the existing Learning module's workflow only.

## What is honestly NOT fully closed

1. **E2E test is written, not executed.** `tests/e2e/learning-workflow.spec.ts` (Playwright) was authored against the real routes and actions added in this change and is structurally correct, but there is no live Supabase project or seeded test user in this sandbox to run it against. The spec `test.skip()`s itself when `E2E_USER_EMAIL`/`E2E_USER_PASSWORD` env vars are absent, so it will not falsely report a pass — it will report "skipped" until pointed at a real environment with seeded data (a tenant, a learning path, and at least one lesson-type module).
2. **Playwright was not previously a dependency anywhere in this monorepo.** It was added minimally at the root (`@playwright/test` devDependency, `tests/e2e/playwright.config.ts`, `npm run test:e2e` script) since no existing test runner convention covered E2E browser tests.
3. **`in_progress` status is defined in schema and types but never explicitly set by any code path** — the current flow only ever writes `enrolled` (on enroll) or `completed` (on lesson completion). This is a legitimate, intentional simplification: with only one lesson type of progress event in scope, there was no natural trigger for an intermediate "started but not finished" state without inventing additional UI (e.g., a "start lesson" click distinct from "complete lesson"), which the brief did not ask for. The column and status value exist and are usable by a future module-level "started" action.
4. **Career signal only covers the learning component.** As described above, `student_twins`'s other eight scores remain 0/untouched. This is explicitly scoped out (Phase 7 / full Career Engine rebuild).
5. **Auth/session plumbing for the E2E test is assumed, not verified live** — the spec relies on the existing `(auth)/login` form fields (`Email`/`Password` labels, `Authenticate` button) read directly from `apps/web/app/(auth)/AuthGateway.tsx`; this matches the real component but was not click-tested in a browser in this environment.

## Verification performed

- `npm run typecheck` (root) — **PASS** (`@zig/data-access` and `@zig/services` both clean).
- `npm run build` (root) — **PASS** (`web` and `admin` Next.js builds both succeeded; new routes `/learning/[id]`, `/learning/module/[id]`, `/learning/lesson/[id]` appear in the route manifest).
- `npm run test --workspace @zig/data-access` / `--workspace @zig/services` — **PASS** (these are typecheck-aliased in this repo's current setup; no dedicated unit tests were added for the new service methods in this change — see honesty note below).
- `tests/e2e/learning-workflow.spec.ts` — **NOT RUN** (no live Supabase instance available; see above).

**Unit test added and executed:** `packages/services/src/tests/learning-workflow.test.ts` follows the exact self-executing-assertion pattern already used by `service-layer.test.ts`/`vertical-slice.test.ts` in the same directory. It exercises the full in-memory flow: create a path + two lesson modules → `enroll` → `completeLesson` (lesson 1) → assert 50% completion and a `student_twins` row with `learningScore === 50` → `completeLesson` (lesson 2) → assert 100% completion and `getLearnerSummary` reporting `enrolledPathCount: 1`, `completedLessonCount: 2`. This was run directly with `npx tsx src/tests/learning-workflow.test.ts` from `packages/services/` and exited 0 (no thrown assertion errors). The two pre-existing test files were also re-run the same way as a regression check and both still exit 0. Note that the package's own `npm run test` script only runs `typecheck`, not these scripts at runtime — that limitation pre-dates this change and was not introduced by it.
