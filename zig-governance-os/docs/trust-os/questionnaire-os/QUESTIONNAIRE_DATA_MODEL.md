# Questionnaire OS — Data Model

> Batch 12. Defines the entities Questionnaire, Question, Response, EvidenceReference,
> ControlReference, FrameworkReference, TrustReview, Approval; maps each to existing tables
> where one exists, and reconciles explicitly with `vendors.questionnaire jsonb`
> (`supabase/migrations/202606190002_mvp_convergence_schema.sql:93`), the only existing
> questionnaire-shaped data found in this codebase (re-verified in Batch 11).

## Reconciliation with `vendors.questionnaire jsonb`

`vendors.questionnaire` is a jsonb array, default `'[]'::jsonb`, scoped to one vendor row. It
has no documented internal schema anywhere in the migrations (no check constraint, no
generated column, no comment) — it is a free-form bag for whatever the Vendor Risk UI
currently writes into it.

**Decision: Questionnaire OS does not replace this column in this docs-only phase.** It is
out of scope to migrate or backfill `vendors.questionnaire` here — that is an implementation
decision for whoever builds this. What this document specifies instead:

1. The new `questionnaires` / `questions` / `responses` tables below are the canonical model
   going forward for any *new* questionnaire instance created through Questionnaire OS,
   vendor-related or not.
2. When a vendor questionnaire is created through Questionnaire OS, the `questionnaires` row
   carries a `vendor_id` reference (nullable — most questionnaires are not vendor
   questionnaires; see Entities below) so vendor-context questionnaires live in the same
   structured model rather than forking a second schema for vendor use only.
3. `vendors.questionnaire jsonb` is left untouched and is explicitly flagged here as a
   **future migration candidate** (read the existing jsonb rows, materialize them into
   `questionnaires`/`questions`/`responses`, then either deprecate the column or keep it as a
   denormalized cache) — that migration is implementation work, intentionally not performed
   in this documentation batch.

## Entities

### Questionnaire

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | FK `tenants.id`, mandatory tenant scope, consistent with every existing table in `supabase/migrations/` |
| `project_id` | uuid | FK `projects.id`, nullable — anchors into the Universal Governance Model chain (`CLAUDE.md:95`) when the questionnaire is tied to a specific project |
| `vendor_id` | uuid | FK `vendors.id`, nullable — set only for vendor-originated questionnaires (see reconciliation above) |
| `name` | text | |
| `source` | text | `'upload'` \| `'template'` \| `'manual'` — matches the Trust Agent MVP upload flow (Batch 20) |
| `status` | text | `'draft'` \| `'in_progress'` \| `'in_review'` \| `'approved'` \| `'exported'` \| `'archived'` |
| `created_at`, `updated_at` | timestamptz | |

### Question

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `questionnaire_id` | uuid | FK `questionnaires.id` |
| `text` | text | the literal question text |
| `domain` | text | one of the nine domains in `QUESTION_DOMAIN_LIBRARY.md` (Batch 13) |
| `classification` | text | per `QUESTION_CLASSIFICATION_MODEL.md` (Batch 13) |
| `order_index` | integer | display/source order |
| `created_at`, `updated_at` | timestamptz | |

### Response

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `question_id` | uuid | FK `questions.id` |
| `answer_text` | text | per `QUESTIONNAIRE_RESPONSE_ENGINE.md` (Batch 16) |
| `confidence_score` | integer | 0-100, per `CONFIDENCE_SCORING_MODEL.md` (Batch 17). **Distinct from, and never written into,** `governance_scores.score` (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:289`) — see explicit non-collision statement in `CONFIDENCE_SCORING_MODEL.md`. |
| `drafted_by` | text | `'ai'` \| `'human'` |
| `review_status` | text | `'unreviewed'` \| `'in_review'` \| `'approved'` \| `'rejected'` — feeds `TrustReview` below |
| `created_at`, `updated_at` | timestamptz | |

### EvidenceReference

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `response_id` | uuid | FK `responses.id` |
| `evidence_id` | uuid | FK `evidence.id` — the **existing** `evidence` table (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:190-202`), read via the **existing** `EvidenceService.findByControl` (`packages/services/src/EvidenceService.ts:5-7`). This join table is new; the evidence record itself is not. |
| `relevance_note` | text | why this evidence was attached, for explainability (ties to CLAUDE.md's "Explainable AI only" rule, `CLAUDE.md:113-114`) |

### ControlReference

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `question_id` | uuid | FK `questions.id` — mapping happens at the question level so it is reusable across every response to that question, not duplicated per response |
| `control_id` | uuid | FK `controls.id` — the **existing** `controls` table, read via the **existing** `ControlService` (`packages/services/src/ControlService.ts`) |

### FrameworkReference

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `control_reference_id` | uuid | FK `control_references.id` |
| `framework_id` | uuid | FK `frameworks.id` |
| `requirement_id` | uuid | FK `framework_requirements.id`, nullable | 
| Notes | — | This table is largely a convenience denormalization: the same data is reachable by joining `control_references` → `control_mappings` (via `ControlService.findMappings`, `ControlService.ts:12-14`) → `frameworks`. It is included as a first-class entity because the questionnaire export (Batch 19) needs to read "framework + requirement" in one query per response, not a three-table join per row. |

### TrustReview

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `questionnaire_id` | uuid | FK `questionnaires.id` |
| `stage` | text | `'compliance'` \| `'security'` \| `'legal'`, per `TRUST_REVIEW_WORKFLOW.md` (Batch 18) |
| `reviewer_user_id` | uuid | FK `users.id` |
| `status` | text | `'pending'` \| `'approved'` \| `'changes_requested'` — mirrors the existing `evidence_reviews.status default 'pending_review'` pattern (`supabase/migrations/202606180005_grc_core_engine.sql:234`) rather than inventing a new status vocabulary |
| `notes` | text | |
| `reviewed_at` | timestamptz | |

### Approval

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `questionnaire_id` | uuid | FK `questionnaires.id` |
| `approver_user_id` | uuid | FK `users.id` |
| `status` | text | `'pending'` \| `'approved'` \| `'denied'` |
| `decided_at` | timestamptz | |

## What is genuinely new vs. reused

| Entity | New table? | Reuses existing table |
|---|---|---|
| Questionnaire | Yes (net-new) | references `projects`, `vendors` |
| Question | Yes (net-new) | — |
| Response | Yes (net-new) | — |
| EvidenceReference | Yes (net-new join table) | references existing `evidence` |
| ControlReference | Yes (net-new join table) | references existing `controls` |
| FrameworkReference | Yes (net-new join table) | references existing `frameworks`, `framework_requirements` |
| TrustReview | Yes (net-new) | mirrors existing `evidence_reviews` status pattern |
| Approval | Yes (net-new) | mirrors existing `policy_approvals` status pattern |

No table proposed here duplicates an existing table. `vendors.questionnaire jsonb` remains
untouched per the reconciliation decision above.
