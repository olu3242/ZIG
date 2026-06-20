# ZARA Rubric Engine

## Purpose
Defines how a lab's Scoring Rubric table (already present in every `docs/learning/labs/*.md`
file) is interpreted programmatically to produce a weighted pass/fail outcome.

## Input
Every lab's Scoring Rubric is a markdown table of `Criterion | Weight` rows summing to
100%. The Rubric Engine treats each row as one scoring dimension.

## Scoring model
For each criterion:
1. ZARA (the relevant persona, per `ZARA_PERSONA.md`) produces a verdict: pass (100%),
   partial (50%), or fail (0%) for that criterion, following the `FEEDBACK_MODEL.md`
   structure.
2. `criterion_score = verdict_value * criterion_weight`
3. `total_score = sum(criterion_score)` across all criteria.
4. Pass threshold mirrors the tier thresholds in
   `docs/assessments/ASSESSMENT_ENGINE_ARCHITECTURE.md` (70% module-quiz-equivalent,
   75% track-assessment-equivalent) — labs use the 75% threshold since they are
   track-level deliverables, except the Capstone, which is rubric-based without a %
   threshold per the Capstone tier definition.

## Backing data
No dedicated rubric-scoring table exists on `main`. This is a documented gap: the Rubric
Engine is specified here as the contract a future scoring service must implement,
consuming the rubric tables already authored in `docs/learning/labs/*.md` rather than
duplicating them in a new schema.

## Worked example
`docs/learning/labs/RISK_LAB_CREATE_ENTERPRISE_RISK_REGISTER.md` has 4 criteria at 25% each.
If the learner scores pass/pass/partial/fail: `(100*0.25)+(100*0.25)+(50*0.25)+(0*0.25) =
56.25%` → below the 75% lab pass threshold → Auditor and Mentor personas explain the
partial and failed criteria with a suggested fix each.

## What this wave does NOT do
Does not create a scoring table or wire this engine into any service. The 8 existing lab
rubrics are the only input this engine needs once it's implemented.
