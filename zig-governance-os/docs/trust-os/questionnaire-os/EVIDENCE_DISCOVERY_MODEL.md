# Questionnaire OS — Evidence Discovery Model

> Batch 15. How the Questionnaire OS finds candidate evidence for a question/response. This
> document is the questionnaire-side consumer of Evidence OS's discovery model
> (`evidence-os/EVIDENCE_DISCOVERY_MODEL.md`, Batch 26) — the search logic itself is owned by
> Evidence OS; this document specifies what Questionnaire OS asks for and what it does with
> the result.

## Search sources (consumed, not owned, by Questionnaire OS)

| Source | Existing artifact | Status |
|---|---|---|
| Policies | `policies` table (`supabase/migrations/202606180005_grc_core_engine.sql:319+`) | EXISTS |
| Procedures | No dedicated `procedures` table found — procedures are currently represented as `policies` rows or as `evidence` rows with no procedure-specific type column (re-verified: grep for "procedure" across `supabase/migrations/*.sql` finds no table) | MISSING as a distinct entity — treated as a Policy subtype for now |
| Standards | Represented as `frameworks`/`framework_requirements` (existing) | EXISTS, via framework metadata |
| Assessments | `assessments` table exists (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:228`) but **no service wraps it** (re-confirmed in Batch 11 audit) | EXISTS at data layer only |
| Audit reports | `audits`, `audit_findings` (existing, no `AuditEngagementService`) | EXISTS at data layer only |
| Existing evidence | `evidence` table, via `EvidenceService.findByControl` | EXISTS, fully wired |

## Discovery flow for a single question

```
Question (with ControlReference, if mapped — Batch 14)
   │
   ▼
1. Exact match:    EvidenceService.findByControl(context, controlId)      [REUSE]
   │
   ▼
2. If zero results, broaden:  search policies/procedures/standards/assessments/audit
   reports for the question's domain (Batch 13) and free-text keywords
   — this broadening step is NEW logic; it does not exist today in any service.
   │
   ▼
3. Rank candidates by: control-id exact match > domain match > keyword match
   (ranking weights are an Evidence OS concern — see evidence-os/EVIDENCE_MATCHING_RULES.md
   once that document exists in the companion PR; Questionnaire OS only consumes the ranked
   list, it does not define the ranking algorithm twice.)
   │
   ▼
Output: Relevant Evidence Package — an ordered list of EvidenceReference candidates,
        each carrying a relevance_note for explainability (per QUESTIONNAIRE_DATA_MODEL.md)
```

## Relevant Evidence Package — structure

| Field | Description |
|---|---|
| `question_id` | the question being answered |
| `candidates[]` | ordered list of `{evidence_id, relevance_score, relevance_note, source_type}` |
| `exact_match_count` | how many candidates came from step 1 (control-exact) vs. step 2 (broadened) — surfaced to the reviewer so a broadened/fuzzy match is never presented with the same confidence as an exact one |

This package is what the AI Drafting step (Batch 16) consumes to populate
`EvidenceReference` rows on a `Response`. Questionnaire OS never invents evidence content —
it only selects from `Relevant Evidence Package` candidates, each traceable to a real
`evidence` row.
