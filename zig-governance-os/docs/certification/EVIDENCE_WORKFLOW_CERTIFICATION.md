# Evidence Workflow Certification

**Date:** 2026-06-19
**Scope:** Close the Evidence workflow end-to-end (record evidence against a control →
link into the Universal Governance Model → single-reviewer approve/reject → dashboard
stats), per `docs/certification/E2E_GAP_REPORT.md` (Evidence: **PARTIAL** — "Schema
complete (`evidence`, `control_evidence`, `evidence_reviews`). `EvidenceService` implements
only `findByControl()` — a read. No upload UI, no review/approve action in any route.").
Follows the exact pattern used to close Assessments
(`docs/certification/ASSESSMENT_WORKFLOW_CERTIFICATION.md`) and Labs
(`docs/certification/LAB_WORKFLOW_CERTIFICATION.md`).

This document is evidence-backed: every claim cites the file and the actual insert/update
call. No claim of closure is made for anything not actually wired to a real read/write
through the repository layer.

## Schema — KEEP, no new migration

Checked first, per the gap report's own citation and direct inspection of
`supabase/migrations/202606180001_batch_21_core_data_platform.sql` (lines 190–202) and
`supabase/migrations/202606180005_grc_core_engine.sql` (lines 111–121, 229–240):

- **`evidence`** (base table, `202606180001`, lines 190–202): `id`, `tenant_id`,
  `project_id`, `control_id` (FK to `controls`), `submitted_by_user_id`, `title`, `status`
  (default `'missing'`), `source_uri`, `submitted_at`, `created_at`, `updated_at`. RLS
  already enabled and `set_evidence_updated_at` trigger already wired (same file, lines
  363, 386 — confirmed by direct grep, not assumed).
- **`control_evidence`** (`202606180005`, lines 111–121): `id`, `tenant_id`, `control_id`,
  `evidence_id`, `coverage` (default `'supporting'`), audit columns. Already in the
  tenant-isolation `do $$ ... $$` RLS + trigger loop at the bottom of that migration (line
  380).
- **`evidence_reviews`** (`202606180005`, lines 229–240): `id`, `tenant_id`, `evidence_id`,
  `reviewer_user_id`, `status` (default `'pending_review'`, **no CHECK constraint** — any
  text value is structurally accepted, so `'approved'`/`'rejected'` were chosen as the
  application-level decision values), `reviewed_at`, audit columns. Already in the same RLS
  + trigger loop (line 382).

**Decision: KEEP all three tables as-is. No migration was written.** Every column needed
for upload, control-linkage, and single-reviewer approve/reject already existed with RLS
and `updated_at` triggers already wired by `202606180001` and `202606180005`. Writing a new
migration to re-apply RLS/triggers that already exist would have been redundant, not
"extending."

**File-storage check (per task instructions):** grepped every migration in
`supabase/migrations/` for `documents`, `files`, `attachments`, and `storage` table
definitions — no hits. No file-storage table exists anywhere in this schema. **Decision:**
evidence is persisted as `title` + the existing `evidence.source_uri` text column (already
present on the base table, not a new column) holding an optional URL/reference string. No
binary upload, no virus scanning, no file-storage table was added — this is the explicit,
documented limitation, not an oversight.

## Types / data-access layer

- `packages/types/src/index.ts`: added `sourceUri?: string` to the existing `Evidence`
  interface (the column already existed in the DB; the TS interface had simply never
  exposed it). Added new `ControlEvidence` (`ControlEvidenceCoverage`) and `EvidenceReview`
  (`EvidenceReviewStatus`) interfaces mirroring the real column sets above — no field was
  invented that doesn't have a real database column.
- `packages/data-access/src/records.ts`: added `ControlEvidenceRecord` and
  `EvidenceReviewRecord` (each `& { createdAt: Date; updatedAt: Date }`), following the
  exact convention used for every other `*Record` type in the file.
- `packages/data-access/src/repositories.ts`: added `controlEvidence` and
  `evidenceReviews` to the `ZigRepositories` interface and wired both in
  `createSupabaseRepositories` (real `SupabaseRestAdapter` writes, table names
  `"control_evidence"` and `"evidence_reviews"`) and `createInMemoryRepositories` (for
  tests), identical wiring style to every existing repository entry.

## Service layer

`packages/services/src/EvidenceService.ts` was rewritten from a single read-only method to:

- `findByControl(context, controlId)` — unchanged, still a real `findMany` against
  `evidence`.
- `findLinksForControl(context, controlId)` — real `findMany` against `control_evidence`.
- `findReviews(context, evidenceId)` — real `findMany` against `evidence_reviews`.
- `createEvidence(context, { title, controlId, sourceUri })` — looks up the control via the
  injected `controlRepository` to derive `projectId` (evidence must belong to the same
  project as its control — no orphan entity), persists a real `evidence` row with
  `status: 'submitted'` (not the table's default `'missing'`, since a record was actually
  provided), then calls `linkToControl` so the Evidence → Control edge in the Universal
  Governance Model is never missing.
- `linkToControl(context, evidenceId, controlId)` — real `create` against
  `control_evidence`, **idempotent**: checks for an existing `(controlId, evidenceId)` row
  first and returns it instead of duplicating.
- `reviewEvidence(context, evidenceId, { status: 'approved' | 'rejected' })` — persists a
  real `evidence_reviews` row (`reviewerUserId` from `context.actorUserId`, `reviewedAt`
  set), then updates the `evidence` row's own `status` to `'approved'` on approval (left as
  `'submitted'` on rejection, so a rejected item is not silently treated as missing again).
  This is a **single-reviewer** workflow — see Honesty section below.
- `getEvidenceSummary(context)` — real, tenant-scoped count of all evidence rows and how
  many are `status !== 'approved'` (pending) vs `status === 'approved'`, used by the
  dashboard. No hardcoded numbers.

`packages/services/src/factory.ts`: `EvidenceService` constructor now takes
`repositories.evidence`, `repositories.controlEvidence`, `repositories.evidenceReviews`, and
`repositories.controls` (read-only use, for `createEvidence`'s control lookup).

## Routes / actions

- `apps/web/app/evidence/page.tsx` — **rewritten** from a shell (`EvidenceManagementEngine`
  with hardcoded `health()`/`"Sources" value="6"`/static rows) to a real page: loads real
  controls and evidence via `loadEvidence()`, renders a real upload form
  (`uploadEvidenceAction`) with a control picker populated from `services.controls.findMany`,
  and an Evidence Register table with real per-row Approve/Reject forms
  (`reviewEvidenceAction`).
- `apps/web/app/lib/actions.ts` — added `uploadEvidenceAction` (calls
  `services.evidence.createEvidence`, records a `create` audit event, redirects to
  `/evidence`) and `reviewEvidenceAction` (calls `services.evidence.reviewEvidence`, records
  a `review` audit event, redirects to `/evidence`).
- `apps/web/app/lib/data.ts` — added `loadEvidence()` (real controls + evidence + per-row
  review history) and wired `services.evidence.getEvidenceSummary(context)` into
  `loadDashboard()`'s `stats` (`evidenceCount`, `evidencePendingReviewCount`,
  `evidenceApprovedCount` — no hardcoded values).
- `apps/web/app/dashboard/page.tsx` — added a stat row rendering the three new evidence
  dashboard fields.

## Tests

`packages/services/src/tests/evidence-workflow.test.ts` (new, self-executing, mirrors
`assessment-workflow.test.ts`/`lab-workflow.test.ts` style) asserts, against
`createInMemoryRepositories()`:

1. `createEvidence` persists a real `evidence` row (`status: 'submitted'`, correct
   `projectId` inherited from the control) and a real `control_evidence` link row.
2. `linkToControl` called a second time for the same pair does **not** create a duplicate
   row (idempotency).
3. `findByControl` returns the persisted row.
4. `getEvidenceSummary` reports 1 pending / 0 approved before any review.
5. `reviewEvidence({status:'rejected'})` persists a real `evidence_reviews` row and leaves
   the evidence row's status as `'submitted'` (not silently approved).
6. `reviewEvidence({status:'approved'})` persists a second `evidence_reviews` row and flips
   the evidence row's status to `'approved'`.
7. `getEvidenceSummary` reports 0 pending / 1 approved after approval.
8. `createEvidence` against a non-existent `controlId` throws rather than silently
   succeeding with a guessed `projectId`.

**Run result:** `npx --yes tsx src/tests/evidence-workflow.test.ts` — **exit code 0**.

**Regression suite re-run, all exit code 0:**
- `npx --yes tsx src/tests/learning-workflow.test.ts`
- `npx --yes tsx src/tests/assessment-workflow.test.ts`
- `npx --yes tsx src/tests/lab-workflow.test.ts`

## Typecheck / build

- `npm run typecheck` (root) → runs `tsc --noEmit` for `@zig/data-access` and
  `@zig/services` — **zero errors**.
- `npm run build` (root) → builds `web` and `admin` Next.js apps with Turbopack — **zero
  errors**, all 58 routes in `web` (including `/evidence`, `/dashboard`) compiled and
  prerendered/server-rendered successfully.

## What is honestly NOT closed

- **No file storage.** `evidence.source_uri` is a free-text field. There is no upload
  endpoint, no object storage bucket, no virus/malware scanning, and no validation that the
  URL points to anything real. A user can type any string.
- **Single-reviewer only.** `reviewEvidence` records one reviewer's decision per call.
  There is no quorum/multi-approver workflow, no "requires N approvals" concept, and no
  reviewer-role check beyond requiring a signed-in `actorUserId` — any authenticated tenant
  user can approve or reject any evidence in their tenant.
- **No automatic evidence staleness/expiry.** Nothing marks an approved evidence row as
  expired after a retention period, even though `evidence_types.retention_days` exists in
  the schema — that column is still unused by any service.
- **No framework-requirement linkage surfaced in the UI.** `control_evidence` only links
  Evidence to a Control; the deeper `Control → Framework Requirement` edge is a separate,
  already-existing relationship (`framework_requirements`/`framework_controls`) that this
  change does not query or render. The Universal Governance Model chain Evidence → Control
  is closed; Control → Framework Requirement existed before this change and is unchanged.
- **No bulk upload / bulk review.** One evidence record and one review decision per form
  submission.
- **`getEvidenceSummary`'s "pending" bucket is a status proxy, not a true review-state
  count.** It is computed as `status !== 'approved'`, so a never-reviewed item and a
  rejected-then-not-yet-resubmitted item both count as "pending" — there is no separate
  "rejected, awaiting resubmission" dashboard bucket.
