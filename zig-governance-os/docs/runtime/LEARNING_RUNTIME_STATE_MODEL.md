# Learning Runtime State Model

## Purpose
Names the state each lifecycle stage needs to track, and which existing service (if any)
already has a record shape that can hold it, versus which stage has no home yet. This is
the decision record Wave 4, 5, and 10 each depend on.

## Correction (post-review)
The original version of this table marked Lesson completion as "Fits — no change needed,"
reading `LearningPathRecord` as if it already tracked per-learner state. It does not:
`LearningPath` (`packages/types/src/index.ts`) is `{ id, tenantId, title, description,
progressPercent }` — no `learnerId` field, and `progressPercent` is a single aggregate
value on the path itself, not one value per learner. `LearningModule` similarly has no
`learnerId`, `completed`, or `lastViewedAt` fields. Flagged correctly by review — every
stage below that needs *per-learner* state has the same underlying gap: nothing in
`packages/data-access` today models "this specific learner's progress against this
specific content unit." Updated table reflects this.

A second relevant finding from the same review pass: `packages/data-access` already
defines an `assessments` table (`AssessmentRecord`, wired into both the Supabase and
in-memory adapters), but it is **project-scoped** (`tenantId`, `projectId`, `status`,
`score`), not learner-scoped, and its `Assessment` type (`{ id, learningModuleId, title,
passingScore }`) reads as a single pass/fail definition per module, not a per-learner
attempt log. This table cannot be reused as-is for per-learner quiz/lab attempts without
conflating two different concepts (a project's compliance-readiness assessment vs. an
individual learner's quiz attempt) — doing so would violate the "no duplicate/conflated
entities" principle this repo already enforces elsewhere.

## Stage-by-stage state

| Stage | State needed | Existing record shape | Verdict |
|---|---|---|---|
| Lesson | `started`, `completed`, `lastViewedAt` per learner per lesson node | `LearningPathRecord`/`LearningModuleRecord` — neither has a `learnerId` field | **Gap.** No existing record can hold per-learner lesson progress. |
| Lab | `started`, `submitted`, `score`, `feedback` per learner per lab | None — `ScenarioRecord` models the company/objects, not a learner's attempt | **Gap.** Same shape as Lesson and Assessment below. |
| Assessment | `attempts`, `score`, `passed`, `answers` per learner per assessment | The existing `assessments` table is project-scoped, not learner-scoped — not reusable as-is (see Correction above) | **Gap.** |
| Artifact | The artifact's generated content + export format chosen | Already covered — an artifact is just rendered output of `RiskService`/`ControlService`/`AssetService`/`AuditService`/`EvidenceService` reads. No new state beyond "which export was generated when." | **Fits**, with a thin record for export history. |
| Portfolio | None — pure read-aggregation | N/A | **Fits**, no state model needed; it's a view, not a stored entity. |
| Certification | `issuedAt`, `certificateId`, `trackId`, `competencyScores` per learner | None. | **Gap**, same category as above. |

## Decision (made 2026-06-20): extend `LearningService`, not a new service
The user decided `AssessmentService` should not be built as a new service — assessment
(and, by the same logic, lab) state should be added to `LearningService` instead, keeping
the service-layer constraint ("do not create duplicate architecture") intact.

This decision resolves the *service* question but does not, by itself, resolve the
*schema* question surfaced by the correction above: there is no existing table with a
`learnerId` column anywhere in `packages/data-access`. Extending `LearningService` with
methods for lesson/lab/assessment progress still requires **one new table** —
e.g. `learning_progress` (`id`, `tenantId`, `learnerId`, `learningModuleId`, `kind:
"lesson" | "lab" | "assessment"`, `status`, `score?`, `attemptedAt`, `feedback?`) — because
no amount of service-layer extension can store state that has nowhere to persist.

This is flagged explicitly rather than added silently: the original Batch 46-60/51-70
prompts both stated "no new tables." Adding `learning_progress` would be the one schema
exception required to make per-learner progress real rather than spec-only. Whether to
approve it is left to the user — see the follow-up question raised in this session.

## What this wave does NOT do
Does not create the `learning_progress` table without explicit approval. Does not modify
`LearningService.ts`'s method signatures beyond what's described above until that approval
is given.
