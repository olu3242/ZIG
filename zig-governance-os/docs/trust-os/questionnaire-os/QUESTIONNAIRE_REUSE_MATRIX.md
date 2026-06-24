# Questionnaire OS — Reuse Matrix

> Batch 11. Companion to `QUESTIONNAIRE_OS_AUDIT.md`. One row per component the Questionnaire
> OS needs, classified Reuse / Extend / Build, with the exact existing artifact (or its
> absence) cited.

| Component needed | Classification | Existing artifact | Action |
|---|---|---|---|
| Questionnaire record storage | Build | None. `vendors.questionnaire jsonb` (`supabase/migrations/202606190002_mvp_convergence_schema.sql:93`) is unstructured and vendor-scoped only — it cannot represent a reusable questionnaire template, a question library, or per-question state. | Net-new `questionnaires` table (Batch 12). |
| Question record storage | Build | None — no `questions` table exists. | Net-new `questions` table (Batch 12), with domain/classification fields per `QUESTION_CLASSIFICATION_MODEL.md` (Batch 13). |
| Response record storage | Build | None — no `responses` table for this sense of the word exists (`risk_assessments` is a different entity entirely; see audit). | Net-new `responses` table (Batch 12). |
| Question → Control mapping | Build | None. `control_mappings` (cross-framework control crosswalk, read via `ControlService.findMappings`) is a different relationship — control-to-control, not question-to-control. | Net-new `question_control_map` table or `ControlReference` join (Batch 12/14). |
| Control → Evidence lookup | **Reuse** | `EvidenceService.findByControl(context, controlId)` (`packages/services/src/EvidenceService.ts:5-7`), backed by `evidence` table filtered on `control_id` (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:190-202`). | Call directly from the response engine (Batch 16) once a question resolves to a `controlId`. No new evidence-lookup code needed at this layer. |
| Control → Framework mapping | **Reuse** | `ControlService.findMappings(context, sourceControlId)` (`packages/services/src/ControlService.ts:12-14`), backed by `control_mappings` table. | Call directly to populate the Framework Mapping field of a response (Batch 14/16). |
| Available frameworks list | **Reuse** | `FrameworkService.findAvailableFrameworks(context)` (`packages/services/src/FrameworkService.ts:5-7`). | Call directly wherever the UI or response engine needs the tenant's active framework set. |
| Control record CRUD | **Reuse** | `ControlService` (`BaseService<ControlRecord>`) — `create`/`update`/`delete`/`findById`/`findMany`/`search`, all tenant-scoped (`packages/services/src/BaseService.ts:3`). | No new control CRUD needed; Questionnaire OS only reads controls, never creates them. |
| Evidence record CRUD | **Reuse** | `EvidenceService` (`BaseService<EvidenceRecord>`). | Same — Questionnaire OS reads evidence, it does not create or own evidence records (Evidence OS owns evidence lifecycle; see `evidence-os/`). |
| Confidence Score computation | Build | No scoring logic for questionnaire responses exists anywhere. `governance_scores` (read via `GovernanceService`) is a different, program-level score with a different formula and must not be reused as-is for this purpose (see `TRUST_SCORE_MODEL.md` Batch 9 and `CONFIDENCE_SCORING_MODEL.md` Batch 17 for the explicit non-collision statement). | Net-new scoring function, response-scoped, not program-scoped. |
| Recommendation / "what would help" feed | Extend (pattern reuse only) | `GovernanceService.findRecommendations(context, projectId)` (`GovernanceService.ts:12-14`) establishes the existing pattern: a recommendation repository queried by scope id. | Build a `ResponseRecommendation` concept following the same shape, not reading/writing the same `recommendations` table (different scope: response, not project). |
| Trust Review / Approval workflow state machine | Build | No approval state machine exists in this codebase for any entity at the service layer. `policy_approvals`, `evidence_reviews`, `control_reviews` are status columns on their own domain tables, not a generalized workflow engine. | Net-new `TrustReview`/`Approval` model (Batch 18), modeled after the status-column pattern these existing tables already use (e.g. `evidence_reviews.status default 'pending_review'`, `supabase/migrations/202606180005_grc_core_engine.sql:234`), not a new generic workflow engine package. |
| Export (Excel/CSV/PDF/Word) | Build | `packages/services/src/exports/index.ts` exists as a directory but was not found to contain governance-questionnaire export logic in this session's read — it is part of the existing import/export platform surface (`IMPORT_EXPORT_PLATFORM_SPEC.md` describes it at a different scope). Confirm scope before extending. | Treat as **Extend** only if `packages/services/src/exports/index.ts` is confirmed (at implementation time) to already support generic tabular export; otherwise **Build** a questionnaire-specific exporter. Documented here as a flagged uncertainty, not asserted as fact, since this audit's scope is read-only verification of files already cited above. |
| `/trust/questionnaires` UI | Build | No `apps/web/app/trust/` directory exists. `apps/web/app/vendors/` and `apps/web/app/assessment/[id]/` are the closest adjacent routes but serve different entities (vendor records; a different, non-governance "assessment" route not audited as in-scope here). | Net-new route tree (Batch 20, design only — not implemented in this PR). |

## Summary count

- **Reuse outright**: 4 components (control→evidence lookup, control→framework lookup,
  framework list, control/evidence CRUD).
- **Extend (pattern only, not code)**: 1 component (recommendation feed shape).
- **Build**: 9 components (questionnaire/question/response storage, question→control
  mapping, confidence scoring, approval workflow, export, UI).

This roughly 30/70 reuse/build split is the same conclusion `TRUST_OS_HARMONIZATION_PLAN.md`
(Batch 1-10) reached for Trust OS generally: governance primitives (controls, evidence,
frameworks) are mature and reusable; anything question/response/questionnaire-shaped is
genuinely new.
