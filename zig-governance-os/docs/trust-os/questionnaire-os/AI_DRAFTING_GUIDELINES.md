# Questionnaire OS — AI Drafting Guidelines

> Batch 16. Concrete do/don't rules for the drafting step in `QUESTIONNAIRE_RESPONSE_ENGINE.md`,
> all derived from CLAUDE.md's explainability and zero-empty-state rules.

## Do

- Cite only evidence/controls present in the question's `Relevant Evidence Package` and
  `ControlReference` rows.
- State the matching tier (Tier 1/2/3, per `EVIDENCE_MATCHING_RULES.md`) inline in the
  `relevance_note`, not just in the database — the reviewer-facing UI (Batch 20) must surface
  this, never hide it behind a single "AI-generated" badge.
- Default to "insufficient evidence to answer" when no Tier 1 or Tier 2 evidence exists,
  rather than drafting a confident-sounding answer from a Tier 3 keyword match alone.
- Mark every drafted response `drafted_by: 'ai'` (per `QUESTIONNAIRE_DATA_MODEL.md`) so the
  Trust Review Workflow (Batch 18) always knows whether a human or the AI authored the
  current answer text.
- Surface the AI's classification confidence (Batch 13) alongside the response so a reviewer
  can see if the question itself was ambiguously classified, which is often the real reason
  a draft looks weak.

## Don't

- Never assert compliance status ("Yes, we are SOC 2 compliant") without a Tier 1 evidence
  match for the specific control area asked about.
- Never silently substitute a different control's evidence to fill a gap — if the literal
  control the question maps to has no evidence, say so; do not borrow evidence from an
  adjacent control and present it as if it answers the original question.
- Never overwrite a human-edited response with a new AI draft without creating a new
  `Response` row (preserve history — `Response.created_at` ordering is the audit trail, per
  the same non-destructive-edit principle the codebase already applies to `ControlReference`
  updates in `QUESTION_CONTROL_RELATIONSHIPS.md`).
- Never compute or display a Confidence Score from inside the drafting step itself — scoring
  is independent (`CONFIDENCE_SCORING_MODEL.md`, Batch 17), preventing the drafting logic
  from grading its own homework.

## Relationship to existing AI architecture

`docs/architecture/ai-architecture.md` was re-checked in this session and is still a
**STATUS: STUB** (verified directly — its content is the placeholder bullet list, not a
filled-in spec). It lists "Explainability model: every recommendation must carry reason,
confidence, framework reference" as required content it has not yet written. This document
does not pretend that stub is filled in; it instead applies CLAUDE.md's own explainability
rule (`CLAUDE.md:123-125`) directly, the same way `ai-architecture.md` itself will need to
once written, so the two stay consistent rather than this document inventing a competing
explainability model first.
