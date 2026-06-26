# Evidence OS — Capability Audit

> Batch 21. Fresh audit of `EvidenceService`, evidence-related "engine" packages, and the
> full evidence table family in `supabase/migrations/*.sql`. Every claim re-verified directly
> in this session.

## Service layer

`EvidenceService` (`packages/services/src/EvidenceService.ts:1-8`) extends
`BaseService<EvidenceRecord>` and adds exactly one method:
`findByControl(context, controlId)` (`EvidenceService.ts:5-7`) — a tenant-scoped filter over
the `evidence` repository by `controlId`. No `findExpiring`, no `findByFramework`, no health
computation, no review-workflow methods. This is the **only** evidence logic wired into
`createServices()` (`packages/services/src/factory.ts:15-39`).

## Other evidence-named packages found — re-verified, classified

A grep across `packages/` for evidence-related names found three packages beyond
`packages/services`, none of which appeared in the prior Batch 1-10 services map (re-checked
against `TRUST_OS_EXISTING_SERVICES_MAP.md` — this is new ground covered by this audit):

| Package | File | What it actually does | Wired in? |
|---|---|---|---|
| `packages/evidence/src/index.ts` | `index.ts:1-19` | Exports `EvidenceManagementEngine` with a single method, `health(input, now)`, that maps `{exists, expiresAt, reviewStatus}` to one of six health states: `current`, `expired`, `missing`, `pending_review`, `rejected`, `approved` (`index.ts:10-18`). Pure function — no persistence, no repository, no tenant context. | Not wired into `createServices()`. Consumed by `packages/agent-evidence-review` (below). |
| `packages/autonomous-evidence/src/index.ts` | `index.ts:1-25` | Exports `AutonomousEvidenceEngine` with `health(signal, now)` (`index.ts:12-20`) mapping a different signal shape (`{source, collectedAt, expiresAt, mappedControlIds}`) to a **different** five-state vocabulary: `fresh`, `current`, `expiring`, `expired`, `missing` — and a `mapToControls(signal)` method that just dedupes an existing `mappedControlIds` array (`index.ts:22-24`, not a real mapping algorithm). Pure function, no persistence. | Not wired into `createServices()`. No consumer of this package was found elsewhere in `packages/*/src/` during this audit — it appears to be unconsumed today. |
| `packages/agent-evidence-review/src/index.ts` | `index.ts:1-246` | A full agent vertical slice: imports `EvidenceManagementEngine` from `@zig/evidence` (`index.ts:1`), routes a `DomainEventType` (`evidence.uploaded`, `evidence.review_requested`, `control.tested`) through `recommend()` (`index.ts:76-144`) to produce an `EvidenceReviewRecommendation` (action + confidence + rationale + next steps), then runs it through the existing `AgentRuntime`/`AgentGovernanceGuard` (`index.ts:158-239`). Explicitly documented in its own header comment as recommending only — "it never finalizes" (`index.ts:17-24`). | Wired into the agent runtime (via `AgentRuntime`/`AgentGovernanceGuard`/`getAgentById`), **not** into `createServices()` — it is part of the agent system, not the tenant service layer. |

**Two different, non-interoperable evidence health vocabularies exist in the codebase
today** — `EvidenceManagementEngine` (6 states, review-status-driven) and
`AutonomousEvidenceEngine` (5 states, freshness-window-driven, unused by anything else found
in this audit). This is the single most important finding for `EVIDENCE_HEALTH_MODEL.md`
(Batch 25): Evidence OS must reconcile with both rather than pretend only one exists, and
must not invent a third.

## Table family — re-verified

| Table | Migration:line | Columns confirmed by direct read |
|---|---|---|
| `evidence` | `202606180001_batch_21_core_data_platform.sql:190-202` | `id`, `tenant_id`, `project_id`, `control_id`, `submitted_by_user_id`, `title`, `status` (default `'missing'`), `source_uri`, `submitted_at`, `created_at`, `updated_at` |
| `control_evidence` | `202606180005_grc_core_engine.sql:111-121` | `id`, `tenant_id`, `control_id`, `evidence_id`, `coverage` (default `'supporting'`), `created_by`, `updated_by`, timestamps |
| `evidence_types` | `202606180005_grc_core_engine.sql:217-227` | `id`, `tenant_id`, `name`, `source` (default `'manual_upload'`), `retention_days`, `created_by`, `updated_by`, timestamps |
| `evidence_reviews` | `202606180005_grc_core_engine.sql:229-240` | `id`, `tenant_id`, `evidence_id`, `reviewer_user_id`, `status` (default `'pending_review'`), `reviewed_at`, `created_by`, `updated_by`, timestamps |
| `evidence_collections` | `202606180005_grc_core_engine.sql:242-253` | `id`, `tenant_id`, `name`, `purpose`, `status` (default `'open'`), `due_at`, `created_by`, `updated_by`, timestamps |
| `evidence_jobs` | `202606180006_production_convergence.sql:98-108` | `id`, `tenant_id`, `source`, `status` (default `'queued'`), `scheduled_at`, `created_by`, `updated_by`, timestamps |

There is no `evidence_health`, `evidence_expiration`, or `evidence_request` table anywhere in
the 17 migration files. `evidence.status` (default `'missing'`) is a free-text column, not
constrained to the `EvidenceManagementEngine` or `AutonomousEvidenceEngine` vocabularies above
— a third, ungoverned vocabulary in practice, since nothing enforces that `evidence.status`
values actually use either engine's state names.

## Adjacent data re-checked for Evidence OS relevance

- `assessments` table (`202606180001_batch_21_core_data_platform.sql:228`) — exists, **no
  service wraps it** (re-confirmed; same finding as Batch 11's Questionnaire OS audit).
- `audits`, `audit_findings`, `audit_programs`, `audit_remediations`, `audit_responses` —
  exist as a table family, no `AuditEngagementService` exists.
- `vendors` table, including `vendors.questionnaire jsonb` — exists, no `VendorService`; not
  itself an evidence source but the Vendor Risk domain consumes evidence (cross-referenced
  with `evidence-os/EVIDENCE_TAXONOMY.md`, Batch 23).
- `policy_approvals`, `policy_attestations` (`202606180005_grc_core_engine.sql:334-360`) —
  exist; a policy attestation is itself evidence-shaped (an attestation record proving a
  policy was acknowledged) but is stored on its own table, not in `evidence`. Evidence OS
  treats this as a distinct evidence *type* in the taxonomy (Batch 23) rather than merging the
  tables.
- "Learning artifacts" (named in the task prompt) — re-checked: `learning_assessments`,
  `learner_portfolios`, `achievements`, `badges` exist but are Learning OS / career-readiness
  artifacts (training records for individual learners), not governance evidence for an
  organization's controls. The one legitimate intersection: a completed compliance-training
  module could itself become a "Training Record" evidence type (per `EVIDENCE_TAXONOMY.md`)
  if a tenant chooses to use it that way — but no existing code path performs that conversion
  today.

## Verdict summary

| Component | Verdict |
|---|---|
| Evidence record CRUD | Exists — `EvidenceService` + `evidence` table |
| Control→Evidence join | Exists — `control_evidence` table (note: distinct from, and currently unused by, `EvidenceService.findByControl`, which filters `evidence.control_id` directly rather than joining through `control_evidence`'s `coverage` column — see `EVIDENCE_DATA_MODEL.md` for the reconciliation) |
| Evidence types | Exists — `evidence_types` table, unused by any service |
| Evidence review | Exists — `evidence_reviews` table, unused by any service (only consumed indirectly via the `agent-evidence-review` package's recommendation logic, which reads review status as an *input*, never writes to this table) |
| Evidence collections | Exists — `evidence_collections` table, unused by any service |
| Evidence jobs | Exists — `evidence_jobs` table (collection scheduling), unused by any service |
| Evidence health/freshness scoring | **Partial — two competing engines exist** (`EvidenceManagementEngine`, `AutonomousEvidenceEngine`), neither persisted, neither wired into `EvidenceService` |
| Evidence expiration/alerting | Missing — no table, no service |
| Evidence request workflow | Missing — no table, no service |
| Evidence intelligence (reuse/gap reporting) | Missing — no table, no service |
| `/trust/evidence` UI | Missing — no `apps/web/app/trust/` directory exists; `apps/web/app/evidence/` and `apps/web/app/evidence/[id]/` exist but serve the existing flat `evidence` table view, a different, narrower scope than Evidence OS's six-section UI (Batch 30) |

This audit drives `EVIDENCE_REUSE_MATRIX.md` below and the explicit health-model
reconciliation in `EVIDENCE_HEALTH_MODEL.md` (Batch 25).
