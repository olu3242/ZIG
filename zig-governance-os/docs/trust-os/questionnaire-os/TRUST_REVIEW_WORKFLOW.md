# Questionnaire OS — Trust Review Workflow

> Batch 18. AI Draft → Compliance Review → Security Review → Legal Review → Approval, modeled
> on the existing status-column review pattern already used by `evidence_reviews` and
> `control_reviews` (re-verified in this session), not a new generic workflow engine.

## Flow

```
Response.drafted_by = 'ai', Response.review_status = 'unreviewed'
   │
   ▼
TrustReview(stage='compliance')   status: pending → approved | changes_requested
   │  (on changes_requested: response routes back to drafting, NOT auto-resolved)
   ▼
TrustReview(stage='security')     status: pending → approved | changes_requested
   │
   ▼
TrustReview(stage='legal')        status: pending → approved | changes_requested
   │
   ▼
Approval                          status: pending → approved | denied
   │
   ▼
Questionnaire.status = 'approved' (only once ALL TrustReview rows for the questionnaire
                                     are 'approved' AND the Approval row is 'approved')
```

## Stage gating rules

- Stages run **in order** (compliance → security → legal) for any response classified into
  a regulated domain (Compliance, Security, Privacy, Audit per `QUESTION_DOMAIN_LIBRARY.md`).
  A response in a domain with no legal exposure (e.g. a pure Governance-domain question) may
  skip the legal stage — this skip rule is set per-questionnaire at creation time, not
  inferred per-response, to keep the workflow auditable and predictable.
- A `changes_requested` at any stage sends the response back to `Response.review_status =
  'unreviewed'` and clears any later stage's pending `TrustReview` rows — later stages never
  approve a response that an earlier stage just rejected.
- Final `Approval` cannot be requested until every required `TrustReview` row for the
  questionnaire is `approved` — this is the gate condition in `APPROVAL_MATRIX.md`.

## Why this does not need a new workflow engine

The existing codebase's pattern for review state is a status column with a small fixed
vocabulary on the row that needs reviewing (`evidence_reviews.status default
'pending_review'`, `supabase/migrations/202606180005_grc_core_engine.sql:234`;
`control_reviews` similarly, same migration file). `TrustReview` follows this exact pattern —
one row per (questionnaire, stage), with a status column — rather than introducing a
generic state-machine package. No existing generic workflow/approval engine was found
anywhere in `packages/*/src/` during this audit that this could have instead extended.
