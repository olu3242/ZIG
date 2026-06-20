# ZARA Feedback Model

## Purpose
Defines the structure every piece of ZARA feedback must follow, so feedback is consistent
across all 5 personas and satisfies CLAUDE.md's explainability rule extended to coaching.

## Required feedback structure
Every ZARA feedback response, regardless of persona, must contain:

| Field | Description |
|---|---|
| `persona` | Which of the 5 personas is speaking |
| `criterion` | Which scoring-rubric criterion (from the lab) this feedback addresses |
| `verdict` | Pass / partial / fail against that criterion |
| `reason` | Why — citing the specific gap or strength in the submission |
| `supporting_data` | The specific data point used (e.g. "BIA downtime cost: $40k/hr cited, but no source"; "Control mapped to ISO 27001 A.9.2 only, SOC 2 mapping missing") |
| `confidence` | High/Medium/Low — how certain ZARA is, given the data available |
| `framework_reference` | If applicable, the specific framework clause being checked against |
| `suggested_fix` | One concrete next action the learner can take |

## Persona-specific tone rules
- **Instructor**: explains the underlying concept before suggesting a retry.
- **Reviewer**: stays structural — checks completeness against the rubric, not opinion.
- **Auditor**: never accepts an unjustified number or mapping; always names the missing
  justification specifically.
- **Hiring Manager**: reacts the way a real board/panel would — calls out anything that
  would lose credibility in the room.
- **Mentor**: always follows a critique from another persona with a specific rephrasing
  suggestion, never just "good job" or "needs work."

## Aggregation rule
When a lab has a multi-criterion rubric (see any `docs/learning/labs/*.md` Scoring Rubric
table), ZARA produces one feedback record per criterion, then an overall pass/fail derived
from the rubric's weights — never a single undifferentiated score.

## What this wave does NOT do
Does not implement a feedback-generation service. This is the contract a future
`CoachService` (not yet built) must satisfy.
