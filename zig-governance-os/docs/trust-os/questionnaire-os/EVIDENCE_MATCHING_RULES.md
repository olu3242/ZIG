# Questionnaire OS — Evidence Matching Rules

> Batch 15. Rules the Questionnaire OS applies when deciding whether a candidate evidence
> item (from `EVIDENCE_DISCOVERY_MODEL.md`) is "relevant enough" to attach to a response.
> Matching tiers, not a scoring formula — the scoring formula itself lives in
> `CONFIDENCE_SCORING_MODEL.md` (Batch 17), which consumes the tier as one input.

## Matching tiers

| Tier | Rule | Confidence contribution (consumed by Batch 17) |
|---|---|---|
| Tier 1 — Exact control match | Evidence's `control_id` equals the question's mapped `ControlReference.control_id` | Full weight |
| Tier 2 — Framework requirement match | Evidence's control maps (via existing `control_mappings`, read through `ControlService.findMappings`) to the same framework requirement the question targets, but not the identical control | Partial weight — flagged as "framework-equivalent, not control-exact" in the `relevance_note` |
| Tier 3 — Domain + keyword match | No control-level relationship; evidence found via the broadened search (domain + free-text) in `EVIDENCE_DISCOVERY_MODEL.md` step 2 | Lowest weight — must always be presented to a human reviewer before being cited in an answer, never auto-accepted |

## Hard rules

1. **No evidence is attached without a `relevance_note`.** Every `EvidenceReference` row
   must state which tier matched and why (ties to CLAUDE.md's explainability rule,
   `CLAUDE.md:113-114`, and to the project's "Explainable AI only" hard rule restated in the
   methodology skill).
2. **Tier 3 matches cannot reach `confidence_score >= 70`** regardless of how many Tier 3
   candidates are attached — capped in the Confidence Scoring Model (Batch 17) — because a
   keyword match is not proof of control coverage.
3. **Expired or rejected evidence is never matched.** Questionnaire OS must check evidence
   health before attaching it. As of this audit, two different evidence-health computations
   exist in the codebase — `EvidenceManagementEngine.health()` (`packages/evidence/src/index.ts:10-18`,
   states: current/expired/missing/pending_review/rejected/approved) and
   `AutonomousEvidenceEngine.health()` (`packages/autonomous-evidence/src/index.ts:11-20`,
   states: fresh/current/expiring/expired/missing). Questionnaire OS does not pick a winner
   between these — it defers entirely to whichever health computation Evidence OS designates
   canonical (see `evidence-os/EVIDENCE_HEALTH_MODEL.md`, Batch 25) and simply refuses to
   attach evidence in any `expired`/`rejected`/`missing` state under that canonical model.
