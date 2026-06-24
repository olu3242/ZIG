# AI Security Assistant Model (Batch 37)

## Purpose and explicit non-goal

The AI Security Assistant answers prospect/customer security questions at
`/trust/{slug}/assistant`. It is **explicitly an extension of the Questionnaire Response
Engine's no-hallucination, cite-evidence rule (PR #8) — not a new AI pattern.** This
document does not define a new explainability mechanism; it re-applies the existing one
to a new, externally-facing channel and a narrower, externally-safe corpus.

## The rule being extended (verbatim mechanism, from `QUESTIONNAIRE_RESPONSE_ENGINE.md`)

PR #8's response engine, itself grounded in CLAUDE.md's "every AI recommendation must
carry a reason, supporting data, a confidence level, and framework references" rule,
establishes:

1. An AI-drafted answer **may not assert anything not traceable to at least one
   `EvidenceReference` or `ControlReference` row**; if no evidence/control mapping is
   found, the answer must say so explicitly ("No evidence found — manual input
   required") rather than fabricate.
2. Every citation in answer text must correspond to a real `evidence_id`/`control_id` —
   never an unbacked free-text citation.
3. Confidence Score is computed as an independent step from drafting (separation of
   concerns), not asserted by the drafting step itself.

## How the Assistant extends it

| Questionnaire Response Engine (internal, PR #8) | AI Security Assistant (external, Batch 37) |
|---|---|
| Drafts answers to questionnaire questions for internal review before customer delivery | Answers prospect/customer questions directly, in real time, no internal review step |
| Citation corpus: all `evidence`/`controls` rows the tenant has, via `EvidenceReference`/`ControlReference` | Citation corpus: only `evidence`/`controls` rows reachable through a **published, exposure-safe** path — i.e. rows surfaced via `PublishedDocument`/`PublishedControl` (Batch 32), filtered by the Evidence Center exposure rules (Batch 36) |
| Confidence Score formula: `0.40*Evidence + 0.25*Controls + 0.20*FrameworkMapping + 0.15*ReviewStatus` | Same formula, computed against the same narrower corpus — a question with strong internal evidence but no *published* evidence yields a correctly lower confidence score, because the formula only sees what's actually published |
| No-match outcome: "No evidence found — manual input required" (routes to a human reviewer) | No-match outcome: "I don't have published evidence to answer this — would you like to request access to more detailed documentation?" (routes to `AccessRequest`, Batch 38) |
| Stored in `responses` table, `confidence_score` column | Stored in `AssistantInteraction` (Batch 32), `confidence_score` column, same scale and computation approach |

The rule itself — never assert without a citable row, never fabricate a citation, treat
"no match" as a valid and required answer — is unchanged. Only the corpus and the
no-match escalation path differ.

## Escalation path, not a dead end

Per CLAUDE.md's "no dead ends" lifecycle loop (Create → Analyze → Recommend → Act →
Measure → Report), the Assistant never simply says "I can't answer that." A no-match (or
a question whose only supporting evidence is `nda_required`) triggers an offer to create
an `AccessRequest` (Batch 38) scoped to the relevant `PublishedDocument` rows. This keeps
the Assistant inside the same loop the rest of the platform follows: the visitor's
question becomes an actionable next step (request access), not a dead end.

## Identity and logging

Per `TRUST_CENTER_DATA_MODEL.md`, `AssistantInteraction.visitor_id` is nullable —
anonymous visitors may ask questions freely against `public`-tier content. The moment an
answer would require citing `nda_required` content, the Assistant requires identity
capture (creating or matching a `Visitor` row) before offering the `AccessRequest` path,
since an `AccessRequest` must be attributable to someone.

Every `AssistantInteraction` is logged with its full citation set (`cited_evidence_ids`,
`cited_control_ids`) and confidence score — this is the same explainability discipline
CLAUDE.md requires of internal AI output, applied to a customer-facing surface, and it
also gives the tenant an audit trail of exactly what was told to which prospect.

## What the Assistant must never do

- Never answer from general LLM knowledge about security practices unconnected to this
  tenant's actual published evidence/controls (this would violate the citation rule
  outright).
- Never cite an internal-only `evidence`/`controls` row that has no corresponding
  `PublishedDocument`/`PublishedControl` entry, even if it would produce a more
  confident-sounding answer — the corpus boundary is the exposure boundary, with no
  exceptions for "the AI thought it was relevant."
- Never auto-grant access to `nda_required` content — the Assistant can only initiate an
  `AccessRequest`, never approve one (approval remains an internal human action per
  Batch 38).

## Derivation pipeline

```
Visitor question (text)
        │
        ▼
AssistantService.answer(tenantId, visitorId?, questionText)   (new orchestration service)
        │  — retrieval restricted to PublishedDocument / PublishedControl (exposure-filtered)
        │  — reuses the same evidence/control matching logic the Questionnaire Response
        │    Engine uses internally, scoped to the narrower corpus
        ▼
Citation set (evidence_ids, control_ids) + Confidence Score (same formula as PR #8)
        │
        ├─ match found → answer + citations returned, logged to AssistantInteraction
        └─ no match / nda_required-only match → offer AccessRequest, logged with empty
            or partial citation set (never fabricated)
```
