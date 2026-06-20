# ZARA Career Coach

## Purpose
Tracks a learner's progress across tracks, labs, and artifacts and translates it into
career-readiness signal — closing the loop from "completed content" to "job-ready skill
demonstrated," consistent with the Create → Analyze → Recommend → Act → Measure → Report
lifecycle loop.

## Backing data
Real tables exist for the raw progress signal: `learning_assessment_results`,
`learner_portfolios`, `employment_outcomes`, `mentorship_matches`, `learning_cohorts`
(all from `202606180007_learning_os_e2e.sql`, confirmed present on `main`). No
`CoachService` yet consumes them — that wiring is a documented gap, not built in this
wave.

## What Career Coach does
1. **Skill mapping** — for each completed lab, marks the named Skill (from the artifact's
   `docs/artifacts/*.md` "Skill" field) as demonstrated, with the artifact as evidence.
2. **Career outcome tracking** — aggregates demonstrated skills against each artifact's
   "Career Outcome" field to produce a readiness statement per track (e.g. "Audit track:
   3 of 5 career outcomes demonstrated").
3. **Portfolio assembly** — surfaces the learner's completed artifacts as a portfolio,
   backed by `learner_portfolios`.
4. **Mentor recommendation** — when a learner has a persistent gap (e.g. repeated Auditor
   persona pushback on unjustified scores), recommends a `mentorship_matches` pairing.
5. **Employment signal** — once a track's career outcomes are fully demonstrated, flags
   the learner as ready for the `employment_outcomes` stage for that track.

## Persona used
Mentor, primarily — Career Coach is explicitly forward-looking and constructive, distinct
from the Reviewer/Auditor grading personas used during individual lab submissions.

## What this wave does NOT do
Does not implement the `CoachService` that would read/write these tables. Does not change
any existing table schema — `learning_assessment_results`, `learner_portfolios`,
`employment_outcomes`, `mentorship_matches`, and `learning_cohorts` are used exactly as
they exist today.
