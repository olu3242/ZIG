# Learning Runtime State Model

## Purpose
Names the state each lifecycle stage needs to track, and which existing service (if any)
already has a record shape that can hold it, versus which stage has no home yet. This is
the decision record Wave 4, 5, and 10 each depend on.

## Stage-by-stage state

| Stage | State needed | Existing record shape | Verdict |
|---|---|---|---|
| Lesson | `started`, `completed`, `lastViewedAt` per learner per lesson node | `LearningPathRecord` (`LearningService`) | **Fits.** No change needed. |
| Lab | `started`, `submitted`, `score`, `feedback` per learner per lab | No existing record shape covers a scored submission against a scenario. `ScenarioRecord` (`ScenarioService`) models the company/objects, not the learner's attempt. | **Gap.** Needs either a new field set on an existing learner-scoped record, or a decision to treat labs as a specialization of assessments (see below) — not resolved here. |
4| Assessment | `attempts`, `score`, `passed`, `answers` per learner per assessment | None. No `AssessmentService` exists. | **Gap.** This is the one explicitly named in the Convergence Audit Findings as "exists" — it does not, per `packages/services/src/*.ts`. Flagged for the user/architect to decide: build `AssessmentService` as a new, approved service (an explicit exception to "no new services," since assessments are core to the product, not incidental), or fold assessment state into `LearningService`. |
| Artifact | The artifact's generated content + export format chosen | Already covered — an artifact is just rendered output of `RiskService`/`ControlService`/`AssetService`/`AuditService`/`EvidenceService` reads. No new state beyond "which export was generated when." | **Fits**, with a thin record for export history (could live on `LearningService` or a learner-activity log, not specified further here). |
| Portfolio | None — pure read-aggregation | N/A | **Fits**, no state model needed; it's a view, not a stored entity. |
| Certification | `issuedAt`, `certificateId`, `trackId`, `competencyScores` per learner | None. | **Gap**, same category as Assessment — needs an explicit new-service decision before Wave 10. |

## Recommendation (non-binding — decision belongs to whoever scopes Wave 5/10)
Labs and assessments share a shape (attempt + score + feedback against a known content
unit). If `AssessmentService` is approved as a new service, it should likely also own lab
attempts, rather than creating a second new service for labs — this keeps the "do not
create duplicate architecture" constraint satisfied even when one exception is granted.

## What this wave does NOT do
Does not create `AssessmentService` or any other new service. Does not decide whether the
Lab/Assessment gap is resolved by a new service or an extension — names the choice clearly
enough that the next session can decide it in one read.
