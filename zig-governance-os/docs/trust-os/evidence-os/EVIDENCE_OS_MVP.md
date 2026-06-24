# Evidence OS — MVP

> Batch 30. MVP scope for Evidence OS. DESIGN SPEC ONLY — no route, table, or service
> described here is implemented in this PR. No `apps/web/app/trust/` directory exists today
> (re-verified during this audit); `apps/web/app/evidence/` exists but is a narrower,
> pre-existing flat view of the `evidence` table, not this six-section design.

## MVP scope (minimum to prove the lifecycle end to end)

Lifecycle: Created → Collected → Reviewed → Approved → Mapped → Used → Monitored → Expired →
Archived.

1. Upload evidence (Created/Collected) — writes to the **existing** `evidence` table, no
   schema change required for this step alone.
2. Classify (Evidence Type, per `EVIDENCE_TAXONOMY.md`) — new column on `evidence` or a new
   `evidence_sources` row (Batch 22).
3. Map to a control (Mapped) — writes to the **existing** `control_evidence` table (Batch 22
   reconciliation).
4. Review (Reviewed/Approved) — writes to the **existing** `evidence_reviews` table.
5. Compute health (Monitored) — the routing layer from `EVIDENCE_HEALTH_MODEL.md`, new but
   thin (calls existing `EvidenceManagementEngine`/`AutonomousEvidenceEngine` packages
   unchanged).
6. Surface in Evidence Intelligence (Used/reuse tracking) — read-only queries, Batch 29.
7. Expiration alerting (Expired) — new `evidence_alerts` table, Batch 27.
8. Archive — `evidence.status = 'archived'`, a new allowed value for the existing free-text
   `status` column (no schema change, just a new convention).

## Explicit non-goals for MVP

- No external integrations (SharePoint/Confluence/Drive/OneDrive) — internal sources only.
- No `AssessmentService` build-out — the Evidence↔Assessment edge in
  `EVIDENCE_MAPPING_MODEL.md` remains a documented gap, not solved by Evidence OS's MVP.
- No retroactive backfill of `evidence.control_id` (legacy) into `control_evidence` — new
  evidence created after MVP ships uses `control_evidence` directly; backfilling existing
  rows is a one-time migration task for the implementation phase, intentionally not specified
  further here.
- `EvidenceRequest`/`evidence_collections` wiring (Batch 28) can ship after the core
  lifecycle above proves out — flagged as MVP+1, not MVP.

## Highest-leverage build order (from the reuse matrix)

1. Wire `evidence_reviews`, `control_evidence` into `EvidenceService` (cheapest — existing
   tables, zero migration).
2. Add the health-routing layer (`EVIDENCE_HEALTH_MODEL.md`) — thin, calls existing packages.
3. Add `evidence_sources`, `evidence_alerts`, `evidence_requests` (the three genuinely new
   tables this batch identified).
4. Build the Evidence Intelligence read queries (Batch 29) — pure reporting, no new writes.
