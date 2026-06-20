# Certification Model

> How certification-eligibility should be derived from real signals
> (`student_twins` scores, assessment pass/fail, lab scores), given that no
> certification-eligibility flag exists on any table today. This document specifies
> derivation logic; it does not add a column, table, or service.

## 1. Verified current state

- No table has a column resembling "certification eligible," "cert_status," or similar.
  Confirmed by reading every Learning OS-related migration
  (`202606180001`, `202606180007`, `202606180008`, `202606180011`, `202606180012`,
  `202606180013`).
- The closest existing thing is `certification_journeys.readiness_score`/`.status`
  (`202606180008_learning_agent_workforce.sql`), but `docs/certification/LEARNING_WORKFLOW_CERTIFICATION.md`
  states explicitly this is "a separate, unrelated entity this task was told not to touch
  ... No new flag was invented to avoid scope creep" when the Learning workflow
  certification work was done. This document respects that same boundary: it does not
  propose repurposing `certification_journeys` for eligibility derivation, since that table
  was deliberately left untouched by the most recent, most authoritative work on this
  exact question.
- `student_twins` has a `certification_score` column (one of the 9 score columns,
  `202606180008` lines 3-20) that, like 4 of its siblings, has **no writer today**.

## 2. Proposed derivation (specification only, no implementation)

Rather than a single boolean eligibility flag (which would hide *why* a learner is or
isn't eligible — violating `CLAUDE.md`'s explainable-scoring rule), this document proposes
eligibility be **derived at read time** from existing real signals, surfaced with its
component breakdown, rather than persisted as an opaque flag:

```
isEligibleForCertification(learnerId, certificationTrack) :=
  knowledgeRequirementMet   = student_twins.knowledge_score >= <track threshold, e.g. 70>
    (sourced from AssessmentService.submitAttempt, real, exists)
  AND skillsRequirementMet  = student_twins.skills_score >= <track threshold, e.g. 70>
    (sourced from ScenarioService.scoreAndComplete, real, exists)
  AND completionRequirementMet = all required learning_modules for the track's
    learning_paths row have a 'completed' user_progress row
    (sourced from LearningService.getProgress / ProgressEngine, real, exists)
  AND (capstoneRequirementMet, only for tracks that require one) =
    a capstone_projects row for this learner has status = 'graded' (or equivalent)
    AND portfolio_score >= <track threshold>
    (sourced from capstone_projects — schema exists, no writer yet; see
     PORTFOLIO_ENGINE_ARCHITECTURE.md)
```

Each requirement above is independently explainable: a learner who is not eligible can be
told exactly which requirement(s) failed and by how much, satisfying the explainability
rule. This is preferred over writing a single `certification_score` or boolean — the score
column can still be populated as a **summary** (e.g. an average of the four requirement
percentages), but the underlying requirement breakdown should always be computable, not
discarded once the summary is written.

## 3. Why this document does not propose a new "certification_eligibility" table or column

A new table/column would either (a) duplicate state that's already derivable from
`student_twins` + `user_progress` + `capstone_projects`, risking staleness (the flag says
eligible, but the underlying assessment was later retaken and failed), or (b) require a
trigger/cron to keep it in sync, adding operational complexity not justified until there is
a concrete need to *persist* eligibility (e.g. for a feature like "your eligibility expires
in 90 days" which would need a point-in-time snapshot). Until such a need is identified,
this document recommends compute-at-read-time over a stored flag — consistent with
`student_twins.certification_score` being a *summary number*, not a derived gate.

If a persisted snapshot is later required, the minimal addition would be a single row per
(learner, certification track, computed-at) in a new
`certification_eligibility_snapshots` table — explicitly flagged here as future work, not
proposed for the current phase.

## 4. Relationship to `student_twins.certification_score`

This document proposes `certification_score` be written by whichever service implements
the derivation in Section 2 — most naturally as part of `PortfolioService`
(see `PORTFOLIO_ENGINE_ARCHITECTURE.md`) since both depend on the same set of completion
signals, or as a small standalone `CertificationService` if the derivation logic grows
complex enough to warrant separation. Neither service exists today; this is a specification
for whichever gets built.

## 5. What this document does not do

- It does not add any column or table.
- It does not write any service.
- It does not touch `certification_journeys`.
- It does not pick final numeric thresholds — the `<track threshold, e.g. 70>` placeholders
  above are illustrative, not specified values; thresholds should be set per certification
  track by the product/curriculum owner.
