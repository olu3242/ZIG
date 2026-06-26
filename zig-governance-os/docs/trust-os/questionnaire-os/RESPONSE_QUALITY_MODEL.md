# Questionnaire OS — Response Quality Model

> Batch 17. Coarse quality label derived from Confidence Score, used for UI triage in the
> Review Queue (Batch 20) without requiring reviewers to interpret a raw number.

## Quality bands

| Confidence Score range | Label | Review queue treatment |
|---|---|---|
| 85-100 | High Confidence | Fast-track — single reviewer sign-off sufficient |
| 60-84 | Medium Confidence | Standard review — full Trust Review Workflow (Batch 18) |
| 30-59 | Low Confidence | Flagged — requires Compliance + Security review minimum, cannot skip stages |
| 0-29 | Needs Input | Routed back to drafting/manual entry before entering review at all — never shown to an external requester as a final answer |

## Why bands, not raw score, drive workflow routing

Per `CONFIDENCE_SCORING_MODEL.md`'s worked example, an unreviewed but well-evidenced answer
can already score 85 — high enough to fast-track — while review status itself is only 15
points of the total. This is intentional: review status exists to *confirm* an
already-strong draft, not to be the primary signal of whether the underlying answer is
trustworthy. The bands above route based on evidence/control/framework strength, with
`ReviewStatusComponent` acting as the final 15-point confirmation, mirroring how
`TRUST_SCORE_MODEL.md` treats `assessment_completion` as one of several inputs rather than a
gate.

## Aggregate questionnaire quality

A `Questionnaire`'s overall quality is the mean of its `Response.confidence_score` values,
surfaced in the Export model (Batch 19) as a top-line number alongside the per-response
detail — never collapsed into a single score without the per-response breakdown also being
available, per CLAUDE.md's explainability rule.
