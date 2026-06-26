# Questionnaire OS — Question Classification Model

> Batch 13. How an incoming question (from an uploaded questionnaire) is classified before it
> can be routed to a control. This is a design spec; no classifier is implemented in this
> docs-only batch.

## Classification dimensions

Every `Question` row carries two independent classification fields (per
`QUESTIONNAIRE_DATA_MODEL.md`):

1. **Domain** — which of the nine Trust Taxonomy domains the question belongs to (see
   `QUESTION_DOMAIN_LIBRARY.md` below). This reuses the same nine domains established in
   `TRUST_TAXONOMY.md` (Batch 6) rather than inventing a second domain list — Governance,
   Risk, Compliance, Security, Privacy, Audit, Vendor Risk, Business Continuity, AI
   Governance.
2. **Question type** — orthogonal to domain, describes the shape of the expected answer:
   - `boolean` — "Do you encrypt data at rest?" (yes/no, maps to a control's presence)
   - `descriptive` — "Describe your incident response process." (maps to a policy/procedure
     evidence type)
   - `quantitative` — "What is your password minimum length?" (maps to a control parameter)
   - `evidence_request` — "Provide your SOC 2 report." (maps directly to an Evidence
     Discovery search, Batch 15, skipping control mapping)
   - `attestation` — "I attest that..." (maps to a policy attestation, mirroring the existing
     `policy_attestations` table found in `supabase/migrations/202606180005_grc_core_engine.sql`)

## Classification pipeline (design only)

```
Raw question text
   │
   ▼
Domain classifier  ──► one of 9 domains (QUESTION_DOMAIN_LIBRARY.md)
   │
   ▼
Type classifier    ──► boolean | descriptive | quantitative | evidence_request | attestation
   │
   ▼
Stored as Question.domain + Question.classification
   │
   ▼
Feeds Control Mapping Engine (Batch 14) — domain narrows the candidate control set before
mapping is attempted, the same way the existing Trust Taxonomy narrows framework coverage
checks (TRUST_TAXONOMY.md's cross-domain framework table).
```

## Explainability requirement

Per CLAUDE.md's "Explainable AI only" rule (`CLAUDE.md:113-114`), any AI-assisted
classification must record: the domain/type it assigned, why (e.g. matched keywords or
pattern), and a confidence level — stored alongside the `Question` row's `domain` /
`classification` fields as classification metadata, not silently overwritten if a human
reclassifies the question later (the human override must be preserved as the source of
truth, with the AI's original guess retained for audit).
