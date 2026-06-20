# Lesson Template

Every lesson file under `docs/learning/lessons/<track>/` follows this structure. This is
documentation only — no lesson-body content field exists yet on `LearningModule`
(`packages/types/src/index.ts`), so these files are the authored source; wiring a body
field into the schema is a separate, not-yet-scheduled change.

```
# NN_LESSON_TITLE

## Objectives
- 3 concrete, observable learning outcomes ("the learner can ...")

## Business Context
- Why this matters in a real governance program, 2-4 sentences, no filler

## Scenario Mapping
- Which docs/scenarios/*.md company this lesson's example/exercise uses, and why

## Framework Mapping
- Which framework(s) and which real service/record this lesson trains on
  (e.g. RiskService / RiskAssessment, not an abstract concept)

## Diagram Requirements
- Named visual assets this lesson needs (not text-only — see Visual Assets Required)

## Knowledge Check
- 1-2 representative questions (full bank lives in docs/assessments/)

## Artifact Produced
- What deliverable, if any, this lesson's exercise produces (maps to docs/artifacts/)

## Visual Assets Required
- Explicit diagram/asset list, named, so design work has a concrete backlog
```
