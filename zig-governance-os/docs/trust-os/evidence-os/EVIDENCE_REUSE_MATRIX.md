# Evidence OS — Reuse Matrix

> Batch 21. Companion to `EVIDENCE_OS_AUDIT.md`. Classified Exists / Partial / Missing per
> the task's required classification scheme (note: this differs slightly from the
> Reuse/Extend/Build scheme used in `questionnaire-os/QUESTIONNAIRE_REUSE_MATRIX.md` because
> the task brief specified this scheme for Evidence OS specifically).

| Component | Classification | Evidence |
|---|---|---|
| Evidence record storage | **Exists** | `evidence` table (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:190-202`), `EvidenceService` (`EvidenceService.ts`) |
| Control↔Evidence linkage | **Exists, but split across two mechanisms** | `evidence.control_id` (direct FK, used by `EvidenceService.findByControl`) and `control_evidence` join table with a `coverage` column (`grc_core_engine.sql:111-121`, unused by any service found in this audit) — see `EVIDENCE_DATA_MODEL.md` for which one Evidence OS treats as canonical |
| Evidence types | **Exists, unused** | `evidence_types` table (`grc_core_engine.sql:217-227`) has no service and no seeded rows confirmed in this session — schema exists, nothing reads/writes it at the service layer |
| Evidence review workflow | **Partial** | `evidence_reviews` table exists with a status column; no service wraps it; one read-only consumer exists (`agent-evidence-review` reads review status as an input signal, never writes the table) |
| Evidence collections (batched evidence requests) | **Partial** | `evidence_collections` table exists (`status` default `'open'`, `due_at`) — schema looks like it was designed for exactly the Evidence Request Workflow this task asks for (Batch 28), but no service or route reads/writes it |
| Evidence collection scheduling | **Partial** | `evidence_jobs` table exists (`status` default `'queued'`, `scheduled_at`) — looks designed for recurring evidence refresh, unused at the service layer |
| Evidence health/freshness scoring | **Partial — two non-interoperable engines** | `EvidenceManagementEngine.health()` (`packages/evidence/src/index.ts:10-18`) and `AutonomousEvidenceEngine.health()` (`packages/autonomous-evidence/src/index.ts:11-20`) — see `EVIDENCE_HEALTH_MODEL.md` for the reconciliation decision |
| Evidence expiration alerting | **Missing** | No table, no cron/job found wired to either health engine in this audit |
| Evidence intelligence (most-reused, gap detection) | **Missing** | No analytics/reporting logic over the evidence table family was found anywhere in `packages/*/src/` |
| Evidence discovery (search across sources) | **Missing as a unified capability** | The individual sources exist (`policies`, `controls`, `assessments`, `audits`) but no cross-source search/ranking logic was found |
| AI evidence review recommendation | **Exists, narrow scope** | `packages/agent-evidence-review/src/index.ts` — a real, working recommendation agent, but explicitly recommendation-only (never finalizes/mutates), and only consumes `EvidenceManagementEngine`'s health states, not `AutonomousEvidenceEngine`'s |
| `/trust/evidence` UI | **Missing** | No `apps/web/app/trust/` directory; `apps/web/app/evidence/` exists but is a flat list/detail view of the `evidence` table, not the six-section Evidence OS UI this task specifies (Batch 30) |

## What this means for Evidence OS's build sequence

Three tables already exist with schemas that closely match what Evidence OS needs
(`evidence_reviews`, `evidence_collections`, `evidence_jobs`) but have zero service-layer
code. The highest-leverage, lowest-risk build sequence is: wrap these three tables in
service methods first (cheap, no migration needed), then build the genuinely missing pieces
(health reconciliation, expiration alerting, intelligence, discovery) on top. This is
reflected in the dependency ordering implicit across Batches 22-30 below.
