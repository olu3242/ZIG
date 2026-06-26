# Questionnaire OS — Response Engine

> Batch 16. Defines the structure of a generated response and the rules governing AI
> drafting, directly tying into CLAUDE.md's existing "Explainable AI only" rule.

## Response structure

Per `QUESTIONNAIRE_DATA_MODEL.md`'s `Response` entity, every generated or human-authored
response carries:

| Field | Source |
|---|---|
| Answer | drafted text, or human-entered |
| Supporting Controls | `ControlReference` rows for the question (Batch 14) |
| Supporting Evidence | `EvidenceReference` rows for the response (Batch 12), sourced from the Relevant Evidence Package (Batch 15) |
| Framework Mapping | `FrameworkReference` rows, derived from Supporting Controls via the existing `ControlService.findMappings` (`ControlService.ts:12-14`) |
| Confidence Score | computed per `CONFIDENCE_SCORING_MODEL.md` (Batch 17) |

## Hard rule: no hallucinations

This is a direct restatement and application of CLAUDE.md's existing rule: **"Every AI
recommendation must carry a reason, supporting data, a confidence level, and framework
references"** (`CLAUDE.md:123-125`, restated in the methodology skill as "Explainable AI
only," `.claude/skills/zig-fable5-methodology/SKILL.md:70-71`). Applied to Questionnaire OS
specifically:

1. **An AI-drafted answer may not assert anything that is not traceable to at least one
   `EvidenceReference` or `ControlReference` row.** If the engine cannot find supporting
   evidence or a control mapping, the drafted answer must say so explicitly (e.g. "No
   evidence found — manual input required") rather than producing a plausible-sounding
   answer with nothing behind it.
2. **Every citation in the answer text must correspond to a real `evidence_id`/`control_id`
   in the response's reference tables** — never a free-text citation like "per our security
   policy" with no `EvidenceReference` row backing it.
3. **Confidence Score must reflect the actual evidence/control state**, not be inflated to
   make the answer look more authoritative — enforced by the formula in
   `CONFIDENCE_SCORING_MODEL.md`, not by the drafting step itself (separation of concerns:
   drafting proposes, scoring independently evaluates).

## Drafting flow

```
Question (classified + control-mapped)
   │
   ▼
Fetch Relevant Evidence Package (Batch 15)
   │
   ▼
Draft answer text, citing only fetched evidence/controls
   │
   ▼
Populate Response.answer_text, EvidenceReference[], (Supporting Controls already exist
  at the Question level via ControlReference)
   │
   ▼
Compute Confidence Score (Batch 17) — independent step, not part of drafting
   │
   ▼
Response.review_status = 'unreviewed'  ──► enters Trust Review Workflow (Batch 18)
```

See `AI_DRAFTING_GUIDELINES.md` for the detailed do/don't rules the drafting step must
follow.
