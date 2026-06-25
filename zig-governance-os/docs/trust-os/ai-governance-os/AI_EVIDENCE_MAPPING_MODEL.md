# AI Governance OS — AI Evidence Mapping (Batch 48)

> Batch 48. Chains AI Asset (AI System) → AI Risk → AI Control → AI Evidence → AI Trust
> Score, mirroring the Universal Governance Model spine and the Trust Knowledge Graph's
> already-sketched AI branch (`TRUST_KNOWLEDGE_GRAPH.md`, Batch 5). Per the task
> constraint, this reuses Evidence OS's entities and lifecycle for "AI Evidence" rather than
> inventing a parallel evidence model.

## The chain

```
AI System  ->  AI Risk  ->  AI Control  ->  AI Evidence  ->  AI Trust Score
(Batch 42)    (Batch 44)    (Batch 45)      (this batch)     (Batch 46)
```

This is node-for-node the same shape as the existing platform spine
(`Asset -> Risk -> Control -> Evidence -> Governance Score`) and the Trust OS extension of
it (`Vendor -> Questionnaire -> Evidence -> Trust Score`), per `CLAUDE.md`'s rule that
frameworks and, by extension, AI governance must attach as a typed specialization of the
existing model rather than a disconnected parallel ontology (`CLAUDE.md:107-109`,
restated for the AI branch specifically in `TRUST_KNOWLEDGE_GRAPH.md`).

## AI Evidence is not a new entity — it is the existing `evidence` table, tagged

Per `EVIDENCE_DATA_MODEL.md` (Batch 22) and `EVIDENCE_REUSE_MATRIX.md` (Batch 21), the
`evidence` table and `EvidenceService` already exist and are real, wired code — the only
genuinely reusable foundation found anywhere in this audit area. "AI Evidence" is **not** a
new `ai_evidence` table. It is:

1. A row in the existing `evidence` table, with `control_id` pointing at an `ai_controls`
   row (Batch 45) instead of a general `controls` row — the existing
   `evidence.control_id` FK mechanism, used exactly as documented in
   `EVIDENCE_REUSE_MATRIX.md`'s note that `evidence.control_id` is the canonical
   control-linkage mechanism (as opposed to the unused `control_evidence` join table).
2. Passed through the same Evidence OS lifecycle unmodified: **Created → Collected →
   Reviewed → Approved → Mapped → Used → Monitored → Expired → Archived**
   (`EVIDENCE_DATA_MODEL.md`, Batch 22).

Examples of AI Evidence under this reuse: a model card (Collected → Reviewed → Approved →
Mapped to the Model Evaluation & Monitoring control), a vendor DPA/BAA (mapped to the
Vendor & Provider Due Diligence control), an access-permission audit export (mapped to the
Access & Permission Scoping control), an incident postmortem (mapped to Incident Response &
Escalation).

## Why not a parallel `ai_evidence` table

`EVIDENCE_HEALTH_MODEL.md` (Batch 25) already documents the cost of two non-interoperable
evidence engines coexisting in this codebase (`EvidenceManagementEngine` and
`AutonomousEvidenceEngine`) and treats reconciling them, not adding a third, as the correct
move. Introducing `ai_evidence` as a fourth/parallel structure would repeat exactly the
mistake that document diagnoses. AI Evidence Mapping's job is the **join logic** connecting
`ai_controls` to `evidence`, not a new evidence store.

## Data shape (the join, not a new evidence table)

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant-scoped |
| `ai_control_id` | uuid | FK to `ai_controls` (Batch 45) |
| `evidence_id` | uuid | FK to the existing `evidence` table |
| `ai_risk_id` | uuid | nullable FK to `ai_risks` (Batch 44) — denormalized for direct risk→evidence traceability without always traversing through control |

This is a thin join table, not a competing evidence model — it exists because
`evidence.control_id` is a single FK and an AI Control may be evidenced by multiple
evidence items, and a single evidence item (e.g. one vendor DPA) may satisfy multiple AI
Controls across multiple AI Systems from the same provider.

## Feeding AI Trust Score

The Evidence component of AI Trust Score (Batch 46, 15% weight) is computed as the
percentage of an AI System's mapped AI Controls that have at least one linked,
non-expired (`evidence` row whose health, per `EVIDENCE_HEALTH_MODEL.md`'s reconciled
engine, is not `expired` or `missing`) evidence item via this join table. AI Evidence
Mapping does not compute its own separate score — it is purely the traversal structure AI
Trust Score's Evidence component reads through.

## Acceptance criteria (extends `TRUST_KNOWLEDGE_GRAPH.md`'s acceptance criteria)

- A user can inspect an AI System and see its upstream AI Risks, AI Controls, and the
  Evidence items satisfying each control, the same way they inspect an Asset today.
- No AI Evidence exists without tracing to both an AI Control and the AI System that
  control belongs to — no orphans, consistent with `CLAUDE.md:163-164`.
- AI Trust Score's Evidence component is fully decomposable back to the individual evidence
  rows that produced it.
