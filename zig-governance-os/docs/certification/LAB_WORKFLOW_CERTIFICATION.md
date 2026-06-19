# Lab Workflow Certification

**Date:** 2026-06-19
**Scope:** Close the Labs workflow end-to-end (launch lab → complete task(s) → submit →
score → generate artifact → persist artifact → dashboard update → career signal), per
`docs/certification/E2E_GAP_REPORT.md` (Labs: FAIL) and
`docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md` (#6 Lab Completion, #7 Artifact
Creation: OPEN). Follows the exact pattern used to close Learning
(`docs/certification/LEARNING_WORKFLOW_CERTIFICATION.md`) and Assessments
(`docs/certification/ASSESSMENT_WORKFLOW_CERTIFICATION.md`).

This document is evidence-backed: every claim cites the file and the actual insert/update
call. No claim of closure is made for anything not actually wired to a real read/write
through the repository layer.

## Schema

**New migration:** `supabase/migrations/202606180013_lab_workflow_e2e.sql`

Checked first (per the migration's own header comment, copied below): `scenarios` and
`scenario_runs` (`supabase/migrations/202606180001_batch_21_core_data_platform.sql`, lines
261–283, read directly, not assumed) already store everything needed to track a lab run —
`scenario_runs.status` (`'not_started' | 'running' | 'paused' | 'completed'`),
`scenario_runs.score_delta`, `started_at`, `completed_at`. There is **no** new "lab_runs"
table; `scenario_runs` IS the lab run, reused as-is.

Also checked: `simulated_companies` / `simulated_company_objects`
(`202606180007_learning_os_e2e.sql`, lines 70–93) model a free-floating company simulation
(industry, maturity, arbitrary typed objects) — unrelated to per-scenario task/submission/
artifact tracking, and **not** extended here.

A grep across every migration in `supabase/migrations/` for `lab_task`, `lab_artifact`,
`scenario_task`, and `submission` returned no hits before this change, confirming the audit
finding that no table for lab tasks, submissions, or artifacts existed anywhere. Three new
tables were required, not optional:

- **`lab_tasks`** — per-scenario task definitions: `id`, `tenant_id`, `scenario_id` (FK to
  `scenarios`), `title`, `instructions`, `expected_output_type`, `weight`, `order_index`,
  audit columns.
- **`lab_task_submissions`** — a learner's persisted response to one task within one run:
  `id`, `tenant_id`, `scenario_run_id` (FK to `scenario_runs`), `lab_task_id` (FK to
  `lab_tasks`), `submitted_by`, `content` (`jsonb`), `is_complete`, audit columns. This is
  the table that makes "complete task(s) within [a run]" a real, separately-persisted step
  before scoring — mirroring how `learning_assessment_questions` feeds
  `learning_assessment_results` in the Assessment workflow.
- **`lab_artifacts`** — the scored output of a run: `id`, `tenant_id`, `scenario_run_id`,
  `artifact_type` (`check` constraint: `'risk_register' | 'audit_finding' |
  'gap_assessment' | 'evidence_record' | 'vendor_review'`), `content` (`jsonb`), `score`,
  audit columns.

RLS enabled and `updated_at` trigger wired using the exact same `do $$ ... $$` loop pattern
copied from `202606180007_learning_os_e2e.sql`, `202606180011_learning_progress_e2e.sql`,
and `202606180012_assessment_questions_e2e.sql` — no new RLS pattern was invented.

No existing migration was modified. `scenarios` / `scenario_runs` are reused as-is.

## Types / data-access layer

- `packages/types/src/index.ts`: added `LabTask`, `LabArtifactType`, `LabTaskSubmission`,
  `LabArtifact` interfaces, placed next to the existing `Scenario`/`ScenarioRun`/
  `StudentTwin` interfaces they relate to.
- `packages/data-access/src/records.ts`: added `LabTaskRecord`, `LabTaskSubmissionRecord`,
  `LabArtifactRecord` (same `& { createdAt; updatedAt }` pattern as every other record type
  in this file).
- `packages/data-access/src/repositories.ts`: added `labTasks`, `labTaskSubmissions`,
  `labArtifacts` to `ZigRepositories`, registered in both `createSupabaseRepositories()`
  (table names `lab_tasks`, `lab_task_submissions`, `lab_artifacts`) and
  `createInMemoryRepositories()`. Each is a `TenantRepository<T>` wrapping a
  `SupabaseRestAdapter<T>` / `InMemoryDatabaseAdapter<T>` with the shared `AuditSink`,
  identical in shape to every other repository registration in this file.

## Service layer — `packages/services/src/ScenarioService.ts` (EXTENDED, not new)

**KEEP/EXTEND/MERGE/REMOVE decision: EXTEND `ScenarioService`, do not create a new
`LabService`.** Rationale: `scenario_runs` already *is* the lab-run record (status,
score_delta, started_at, completed_at) and is owned by `ScenarioService`. A separate
`LabService` would have to either duplicate that run state on a parallel table (rejected —
the audit explicitly says don't duplicate what already exists) or hold its own reference to
`scenarioRuns`/`scenarios` repositories anyway, which is just `ScenarioService` with a
different name. The existing class was extended in place, the same class of decision as
`LearningService` absorbing `enroll`/`completeLesson` rather than spinning up a separate
`EnrollmentService`.

`ScenarioService extends BaseService<ScenarioRecord>`, now constructed with five
repositories (`scenarios`, `scenarioRuns`, `labTasks`, `labTaskSubmissions`,
`labArtifacts`, `studentTwins`) plus real methods:

- **`launchLab(context, scenarioId)`** — loads the real scenario (to get its
  `projectId`, required by `scenario_runs`), then `this.runRepository.create(...)` with
  `status: "running"`. Real insert into `scenario_runs`. Throws if the scenario doesn't
  exist rather than silently creating an orphaned run.
- **`findTasks(context, scenarioId)`** — real, `order_index`-sorted read of `lab_tasks`.
- **`completeTask(context, scenarioRunId, labTaskId, submission)`** — idempotent
  find-or-update: if a submission already exists for `(scenarioRunId, labTaskId)` it is
  updated in place via `this.submissionRepository.update(...)`, otherwise a new
  `lab_task_submissions` row is created via `.create(...)`. This prevents re-saving a task
  from inflating the completed-task count used for scoring. Verified directly by the
  runtime test (see below).
- **`scoreAndComplete(context, scenarioRunId, artifactType?)`** — the core scoring logic,
  a real function of persisted data, not a hardcoded average:
  1. Loads the real `scenario_runs` row and the real `lab_tasks` defined for its scenario.
  2. Loads the real `lab_task_submissions` for the run and builds the set of completed
     task ids (`is_complete = true`).
  3. `score = round((sum of completed task weights / sum of all task weights) * 100)` — 0
     if the scenario has zero tasks (verified: does not silently report 100%).
  4. Updates the real `scenario_runs` row: `status: "completed"`, `score_delta: score`,
     `completed_at: now`.
  5. Persists a real `lab_artifacts` row with the computed `score`, the requested
     `artifact_type` (defaults to `'gap_assessment'`), and a `content` payload listing each
     task's completion state — a real generated artifact, not a stub string.
  6. Calls `updateCareerSignal()`, which does a real find-or-create
     `this.studentTwinRepository.update/create(...)` writing `skillsScore`.
- **`getLearnerLabSummary(context)`** — reads all `scenario_runs` rows visible to the
  tenant context and computes `launchedRunCount`, `completedRunCount`, and `latestScore`
  directly from the data (used by both the Practice Lab page and the dashboard).
- **`findRunById`, `findSubmissions`, `findArtifacts`** — thin real reads needed by the new
  routes.

`packages/services/src/factory.ts` updated to construct `ScenarioService` with the three
new repositories plus `studentTwins`, and still exposed as `services.scenarios` (no new
top-level service key was added — Labs is treated as part of the existing Scenario
surface, since it's the same `scenario_runs` row being scored).

## Career/competency signal — real DB write, not a TODO

`ScenarioService.scoreAndComplete` always ends by calling `updateCareerSignal`, which does:
```ts
await this.studentTwinRepository.update(context, twin.id, { skillsScore: score });
// or, if no twin exists yet, a create with all other components at 0.
```
**Column choice: `skillsScore`, not `competencyScore`.** Learning already owns
`learningScore`/`careerScore`; Assessments owns `knowledgeScore`. Labs are hands-on applied
practice (tabletop exercises, drafting real governance artifacts under time pressure) —
that maps most directly to "skills" (practical ability demonstrated) rather than
"competency" (which reads as a higher-level, possibly aggregated judgment best left to a
future holistic Career Engine rollup, explicitly out of scope per Phase 7 in the prior two
certifications). This keeps all three workflows writing disjoint `student_twins` columns,
so none overwrites another's signal.

## Routes — `apps/web/app/learning/practice-lab/`

Checked first: `apps/web/app/learning/practice-lab/page.tsx` existed before this change but
was a shell — it instantiated `PracticeLabEngine` from `@zig/practice-lab` and rendered a
hardcoded `Aster Health` company with no DB I/O, no launch action, and no submit/score path
(confirmed by reading the file directly; this matches the audit's exact description). No
`apps/web/app/labs/` directory existed under either naming convention checked. The existing
`apps/web/app/scenarios/page.tsx` is the canonical **Scenario Workspace** module (product
surface module #3) and was **left untouched** — it is a planning/what-if workspace, a
distinct concept from "Labs" (the Learning-surface hands-on practice exercises), consistent
with how the gap report and traceability matrix treat them as separate rows.

- **`apps/web/app/learning/practice-lab/page.tsx`** (rewritten — the `PracticeLabEngine`
  shell call was removed) — lists real scenarios via `services.scenarios.findMany`, a
  "Launch lab" form per scenario posting to the new `launchLabAction`, and a table of the
  actor's lab runs (`services.scenarios.findRuns` per scenario) linking into the session
  page. Stats row uses `services.scenarios.getLearnerLabSummary`.
- **`apps/web/app/learning/practice-lab/[runId]/page.tsx`** (new) — the lab session: loads
  the real `scenario_runs` row via `findRunById`, its scenario, its `lab_tasks`, its
  `lab_task_submissions`, and (once completed) its `lab_artifacts`. Renders a per-task save
  form (`completeLabTaskAction`) while the run is open, and a "Submit lab for scoring" form
  (`scoreLabAction`) that disappears once the run is `completed`, replaced by the persisted
  artifact table. Shows an honest empty state ("no tasks have been defined") instead of
  faking a submittable run when `lab_tasks` is empty for a scenario.

## Server actions — `apps/web/app/lib/actions.ts`

Added, following the exact pattern of `enrollAction`/`completeLessonAction`/
`submitAssessmentAction` (require tenant context, call a service method, record an audit
event with a result-bearing reason string, redirect):

- **`launchLabAction(formData)`** — reads `scenarioId`, calls
  `services.scenarios.launchLab`, records a `create` audit event on `scenario_runs`,
  redirects to `/learning/practice-lab/{runId}`.
- **`completeLabTaskAction(formData)`** — reads `scenarioRunId`, `labTaskId`, `response`,
  calls `services.scenarios.completeTask`, records a `complete` audit event on
  `lab_task_submissions`, redirects back to the session page.
- **`scoreLabAction(formData)`** — reads `scenarioRunId`, calls
  `services.scenarios.scoreAndComplete`, records a `complete` audit event on
  `lab_artifacts` including the computed score and task counts in the reason string,
  redirects back to the session page (which now renders the artifact).

## Dashboard

`apps/web/app/lib/data.ts` `loadDashboard()` — added a real
`services.scenarios.getLearnerLabSummary(context)` call alongside the existing
tenant/projects/frameworks/learning/assessment queries, surfaced as
`stats.labLaunchedCount` and `stats.labCompletedCount`.

`apps/web/app/dashboard/page.tsx` — added a new stat row ("Labs Launched", "Labs
Completed") below the existing Learning/Assessment row, and added a "Practice Lab" link to
the Quick Actions list (the link existed nowhere on the dashboard before this change).

## Harmonization notes (KEEP / EXTEND / MERGE / REMOVE)

- **EXTEND** `ScenarioService` — checked first whether a new `LabService` was warranted;
  rejected because `scenario_runs` is already owned by this class and is the literal lab
  run record. See full rationale above.
- **EXTEND**, not duplicate, `scenarios` / `scenario_runs` — no new run/definition table was
  created; only the missing task/submission/artifact tables were added.
- **NEW** `lab_tasks`, `lab_task_submissions`, `lab_artifacts` tables and repositories —
  checked first (migration headers grep'd for "lab_task"/"lab_artifact"/"submission" across
  every existing migration); nothing equivalent existed. Required at the schema level, not
  just the service level, exactly as the audit's "blocked at the schema level" framing
  predicted for Artifact Creation.
- **REWRITE** `apps/web/app/learning/practice-lab/page.tsx` — the audit specifically named
  this file as a shell built on `PracticeLabEngine` with a hardcoded `Aster Health` company
  and no write path. That call was removed; the file now renders only real DB-backed data.
  The `@zig/practice-lab` package itself was left in place (not deleted) — deleting a whole
  package was out of scope and nothing else in this change depends on removing it; it is
  simply no longer imported from this file.
- **KEEP** `apps/web/app/scenarios/page.tsx` untouched — distinct canonical Scenario
  Workspace module, not part of this workflow's required chain.
- **EXTEND** `apps/web/app/lib/data.ts` `loadDashboard()` and
  `apps/web/app/dashboard/page.tsx` rather than create new dashboard files, matching
  exactly how the Learning and Assessment stats were added.
- No existing file was deleted. No 12th product module was introduced — Labs is treated as
  part of the existing Learning surface (`/learning/practice-lab`), consistent with how the
  brief scoped this work under "Labs," and with the prior precedent of folding Assessments
  into the Learning surface rather than minting new top-level modules.

## What is honestly NOT fully closed

1. **No task-authoring UI.** `lab_tasks` must currently be inserted directly (e.g. via
   Supabase or a seed script) — there is no admin route to define a scenario's tasks. The
   brief asked to close the launch→complete→submit→score→artifact→dashboard→career chain
   for tasks that already exist, not to build lab-authoring tooling, so this was treated as
   out of scope, exactly mirroring the Assessment certification's identical honesty note
   about question authoring. The session page shows "no tasks have been defined" as a
   clean empty state rather than crashing or faking task data.
2. **`artifact_type` selection is not learner-facing.** `scoreAndComplete` accepts an
   `artifactType` parameter and defaults to `'gap_assessment'` if the caller doesn't
   specify one; the current UI's "Submit lab for scoring" form does not let the learner (or
   the scenario definition) choose among the five allowed types. A more complete version
   would derive the artifact type from the scenario's category/tags. Not implemented —
   scoped out to avoid inventing a scenario-categorization feature that wasn't requested.
3. **`lab_task_submissions.is_complete` is always written `true`.** There is no UI path to
   save a partial/draft response (`is_complete: false`) distinct from a final submission —
   every save via `completeLabTaskAction` is treated as complete. The column exists and is
   read correctly by the scoring logic (`scoreAndComplete` filters on `is_complete`), so a
   future "save draft" affordance can use it without a schema change.
4. **Single-tenant lab-task seeding assumed for the runtime test.** Like the prior two
   workflows, this only updates one `student_twins` component (`skillsScore`) and
   intentionally leaves the other seven untouched on existing rows. The full Career Engine
   aggregation (Phase 7) remains explicitly out of scope.
5. **No live Supabase verification.** All claims above are verified against the in-memory
   repository implementation (`createInMemoryRepositories()`) via the runtime test
   described below, not against a live Supabase project. The Supabase-backed code path
   (`createSupabaseRepositories()` / `SupabaseRestAdapter`) was registered with the exact
   same shape as every other working repository in this file and was typechecked and built
   successfully, but not exercised against a real database in this sandbox.
6. **No Playwright/E2E browser test added**, for the same reason given in both prior
   certifications (no live Supabase/seeded test user in this sandbox). The runtime-executed
   unit test below is the verification method actually exercised.
7. **Re-launching a lab for the same scenario creates a brand-new `scenario_run` every
   time** — there is no "resume the existing in-progress run" check before `launchLab`
   creates one. This mirrors `LearningService.enroll`'s idempotency at the path level but
   was not extended to runs because the brief's flow ("launch → complete tasks → submit →
   score") implies each launch is a fresh attempt, similar to how `submitAttempt` in
   Assessments always creates a new result row rather than capping retakes. Not requested,
   not implemented.

## Verification performed

- **`npm run typecheck` (root)** — **PASS**. `@zig/data-access` and `@zig/services` both
  clean (`tsc -p tsconfig.json --noEmit` for both workspaces, zero errors). One real error
  was caught and fixed during this work: `ScenarioRunRecord` requires `projectId`, which
  `launchLab` initially omitted — fixed by loading the parent scenario first and copying
  its `projectId` onto the new run, the same value `scenario_runs` already used to scope
  itself by project.
- **`npm run build` (root)** — **PASS**. Both `web` and `admin` Next.js builds succeeded.
  The `web` build's route manifest includes the new `/learning/practice-lab` (rewritten)
  and `/learning/practice-lab/[runId]` (new) routes alongside all pre-existing routes,
  with no route conflicts.
- **Unit test added and executed:**
  `packages/services/src/tests/lab-workflow.test.ts`, following the exact
  self-executing-assertion pattern used by `service-layer.test.ts`,
  `learning-workflow.test.ts`, and `assessment-workflow.test.ts` in the same directory. It
  exercises the full in-memory flow: create a scenario + two tasks → `launchLab` (asserts
  `status: "running"`) → `findTasks` (asserts ordered, persisted set) → complete one of two
  tasks → `scoreAndComplete` (asserts 50% score, `scenario_runs` marked `completed` with
  `score_delta: 50`, a `lab_artifacts` row persisted with the requested `artifact_type` and
  score, `student_twins.skillsScore` becomes 50) → launch a second run, complete both
  tasks, score again (asserts 100%, `skillsScore` updates to 100 on the same twin row) →
  re-save a task submission and assert it updates in place rather than duplicating →
  `getLearnerLabSummary` reports `launchedRunCount: 2`, `completedRunCount: 2`,
  `latestScore: 100` → score a scenario with zero defined tasks and assert it scores 0%,
  not silently 100%. Run directly with `npx tsx src/tests/lab-workflow.test.ts` from
  `packages/services/` — **exited 0**.
- **Regression check:** `learning-workflow.test.ts` and `assessment-workflow.test.ts` were
  re-run the same way (`npx tsx src/tests/<file>.test.ts` from `packages/services/`) and
  both still **exited 0**, confirming this change did not break either prior workflow.
