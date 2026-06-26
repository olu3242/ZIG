# Evidence OS — Data Model

> Batch 22. Entities: Evidence Item, Evidence Collection, Evidence Mapping, Evidence Review,
> Evidence Source, Evidence Request, Evidence Expiration, Evidence Health — mapped to the
> existing tables confirmed in `EVIDENCE_OS_AUDIT.md` first, with net-new tables only where
> nothing exists.

## Mapping decision: `evidence.control_id` vs. `control_evidence`

The audit found two control↔evidence mechanisms: a direct `control_id` FK on `evidence`
(used by the only existing service method, `EvidenceService.findByControl`) and a separate
`control_evidence` join table with a `coverage` column, used by no service. **Decision:**
Evidence OS treats `control_evidence` as the canonical mapping going forward (it supports
many-to-many — one evidence item supporting multiple controls, and a `coverage` strength
field neither the direct FK nor anything else captures), and treats `evidence.control_id` as
a legacy single-control convenience field that should be backfilled into `control_evidence`
rows rather than removed (removal is an implementation decision, intentionally not made
here). This reconciliation is necessary precisely because the Evidence Mapping Model (Batch
24, "Evidence→Control→Framework→Assessment→Trust Score") requires many-to-many control
support that the single FK cannot express.

## Entities

### Evidence Item

Maps to the **existing** `evidence` table (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:190-202`).
No new table. Existing columns: `id`, `tenant_id`, `project_id`, `control_id` (legacy, see
above), `submitted_by_user_id`, `title`, `status`, `source_uri`, `submitted_at`,
`created_at`, `updated_at`.

Proposed additions (implementation-time, not performed here): `evidence_type_id` (FK to the
existing but unused `evidence_types`), `health` (see Evidence Health below), `expires_at`.

### Evidence Collection

Maps to the **existing** `evidence_collections` table
(`supabase/migrations/202606180005_grc_core_engine.sql:242-253`). No new table. Existing
columns already match this entity's needs: `name`, `purpose`, `status`, `due_at`. Evidence
OS's job is to wire a service to this table, not redesign its schema.

### Evidence Mapping

Maps to the **existing** `control_evidence` table
(`supabase/migrations/202606180005_grc_core_engine.sql:111-121`), per the reconciliation
decision above. Existing columns: `control_id`, `evidence_id`, `coverage`. No new table.

### Evidence Review

Maps to the **existing** `evidence_reviews` table
(`supabase/migrations/202606180005_grc_core_engine.sql:229-240`). No new table. Existing
columns: `evidence_id`, `reviewer_user_id`, `status` (default `'pending_review'`),
`reviewed_at`. This is also the table `agent-evidence-review`'s recommendation logic reads
review status from (conceptually — the agent package takes `reviewStatus` as an input
parameter rather than querying this table directly today, since it has no repository wiring;
Evidence OS's service layer is what would make that query real).

### Evidence Source

**Net new.** No table represents "where did this evidence come from" beyond the free-text
`evidence_types.source` column (default `'manual_upload'`) and `evidence.source_uri`
(a single URI string). A dedicated `evidence_sources` table is proposed:

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `evidence_id` | uuid | FK `evidence.id` |
| `source_type` | text | `'policy'` \| `'procedure'` \| `'standard'` \| `'assessment'` \| `'audit_report'` \| `'manual_upload'` \| `'integration'`, per `EVIDENCE_TAXONOMY.md` (Batch 23) |
| `source_ref_id` | uuid | nullable — FK into the relevant table (`policies.id`, `assessments.id`, `audits.id`, etc.) when the evidence was derived from an existing governance record rather than freshly uploaded |
| `discovered_via` | text | `'manual'` \| `'evidence_discovery_engine'` (Batch 26) |

### Evidence Request

**Net new.** No table or service supports requesting evidence from an owner. Proposed:

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `control_id` | uuid | FK `controls.id` — what control needs evidence |
| `requested_from_user_id` | uuid | FK `users.id` |
| `status` | text | `'requested'` \| `'assigned'` \| `'collected'` \| `'reviewed'` \| `'approved'` — per `EVIDENCE_REQUEST_WORKFLOW.md` (Batch 28) |
| `due_at` | timestamptz | |
| `resulting_evidence_id` | uuid | FK `evidence.id`, nullable until collected |

This is intentionally a separate entity from the existing `evidence_collections` table:
`evidence_collections` (existing) groups many evidence items under one purpose/deadline (a
batch concept); `Evidence Request` (new) tracks a single ask of a single owner for a single
control's evidence, and may optionally belong to an `evidence_collections` row via a
`collection_id` FK (added to this table) when issued as part of a batch.

### Evidence Expiration

**Net new**, but explicitly a thin layer over existing/proposed health computation rather
than a duplicate engine. See `EVIDENCE_EXPIRATION_MODEL.md` (Batch 27) — no new table beyond
an `evidence_alerts` table (alert log), since expiration state itself is derived from
`Evidence Item.expires_at` + `Evidence Health`, not stored separately.

### Evidence Health

**Net new as a persisted value**, reconciling the two existing pure-function engines found in
`EVIDENCE_OS_AUDIT.md`. See `EVIDENCE_HEALTH_MODEL.md` (Batch 25) for the full reconciliation
and the decision on which engine's vocabulary becomes canonical. Proposed: add a `health`
column to the existing `evidence` table (not a new table), computed by the reconciled engine.

## Summary table

| Entity | New table? | Existing table reused |
|---|---|---|
| Evidence Item | No | `evidence` |
| Evidence Collection | No | `evidence_collections` |
| Evidence Mapping | No | `control_evidence` |
| Evidence Review | No | `evidence_reviews` |
| Evidence Source | Yes | references `policies`, `assessments`, `audits` |
| Evidence Request | Yes | references `controls`, `users`, optionally `evidence_collections` |
| Evidence Expiration | Yes (alert log only) | derives from `evidence.expires_at` + health |
| Evidence Health | No new table — new column on `evidence` | reconciles `@zig/evidence` and `@zig/autonomous-evidence` |

Five of eight entities map to tables that **already exist** — the highest reuse ratio found
in any Trust OS batch so far, because the GRC core engine migration
(`202606180005_grc_core_engine.sql`) was clearly designed with most of this in mind and simply
never got a service layer.
