# Evidence OS — User Journey

> Batch 30. User flow and `/trust/evidence` UI requirements. DESIGN SPEC ONLY — no
> implementation in this PR.

## User flow

```
Upload → Classify → Map → Review → Approve → Use Everywhere
```

| Step | User-visible state | System action |
|---|---|---|
| Upload | User drops a file or links a `source_uri` on `/trust/evidence/new` | Creates an `evidence` row, `status='missing'`→ updated once submitted |
| Classify | Evidence Type + Domain badges shown | Populates `evidence_sources` (Batch 22) |
| Map | User picks one or more controls | Creates `control_evidence` rows (existing table, Batch 22) |
| Review | Reviewer sees pending items in queue | Creates/updates `evidence_reviews` row (existing table) |
| Approve | Status badge flips to Approved | `evidence_reviews.status = 'approved'`; triggers health recompute (Batch 25) |
| Use Everywhere | Evidence now appears as a candidate in Questionnaire OS's Evidence Discovery (`questionnaire-os/EVIDENCE_DISCOVERY_MODEL.md`), in Control coverage views, and in Evidence Intelligence's reuse count | `EvidenceService.findByControl`, `control_evidence` joins — all existing read paths |

## `/trust/evidence` area — required sections

| Section | Purpose | Primary entities shown |
|---|---|---|
| Evidence Library | Browse/search all evidence, filter by domain/type/health | `evidence`, `evidence_sources`, `evidence.health` |
| Evidence Requests | Track outstanding asks, per `EVIDENCE_REQUEST_WORKFLOW.md` | `evidence_requests`, `evidence_collections` (existing) |
| Evidence Mapping | View/edit which controls an evidence item supports | `control_evidence` (existing) |
| Evidence Health | Per-item health state and the weighted 0-100 score | `evidence.health`, `EvidenceHealthScore` (Batch 25) |
| Evidence Intelligence | Reuse, gap, and expiry reporting | Queries from `EVIDENCE_INTELLIGENCE_MODEL.md` (Batch 29) |
| Evidence Expiration | Active alerts, expiring-soon list | `evidence_alerts` (Batch 27) |

## Zero empty states (CLAUDE.md rule applied here)

Per `CLAUDE.md:127-128`: Evidence Library shows demo evidence and an "Upload your first
evidence item" CTA when empty; Evidence Requests explains how requests get created (linked to
a control gap) even with none open; Evidence Mapping shows an example mapping; Evidence Health
explains the scoring weights before any item has a computed score; Evidence Intelligence
shows what each widget will report once data exists; Evidence Expiration explains the
freshness windows (14/45 days, reused from `AutonomousEvidenceEngine`) before any alert fires.

## Navigation placement and relationship to Questionnaire OS's `/trust/questionnaires`

Both `/trust/evidence` and `/trust/questionnaires` (`questionnaire-os/TRUST_AGENT_USER_JOURNEY.md`,
Batch 20) sit under the same `/trust/*` area, raising the identical open question flagged
there: this is a 12th-module-shaped addition to the navigation outside CLAUDE.md's 11
canonical modules, and should be resolved by a `docs/product/prd.md` update before
implementation, not unilaterally decided by either Trust OS sub-area's docs. The two areas
share data (`/trust/evidence`'s Evidence Library is the same `evidence` table
`/trust/questionnaires`'s Evidence Matches section reads from) and should ship under a single
consistent `/trust/` navigation shell rather than two independently-styled sub-apps.
