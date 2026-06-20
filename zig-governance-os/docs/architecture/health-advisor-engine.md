# Health Advisor Engine

## 1. What it does

The Health Advisor turns the seven governance-scoring inputs
(`docs/architecture/governance-scoring-engine.md`) into a ranked list of concrete,
explainable recommendations, persisted to the existing `recommendations` table — the gap
this document replaces was that nothing ever wrote to that table. Every gap the scoring
engine already detects (an input below 100%) becomes one real, actionable recommendation,
not a generic "improve your score" message.

## 2. Trigger

`GovernanceService.runHealthAdvisor(context, projectId)`:

1. Calls `calculateScore(context, projectId)` to get the live 7-input breakdown.
2. For every input strictly below 100%, generates exactly one `Recommendation` row scoped
   to that input (see Section 3 for the mapping). An input at 100% generates no
   recommendation — there is no gap to surface.
3. Persists each recommendation via the existing `recommendationRepository`
   (`RecommendationService` does not exist as a separate service — this is an EXTEND of
   `GovernanceService`, since the recommendations are a direct, tightly-coupled function of
   the score it already computes; splitting them into a separate top-level service would
   mean re-fetching the same six repositories a second time for no benefit).
4. Returns the persisted recommendations, sorted by severity (`critical` > `high` >
   `medium` > `info`).

This is on-demand (called when a user visits the project detail page or governance
view), not a background cron — there is no job scheduler in this stack — but it is run
against live data every time, so it is never stale relative to the data it surfaces.

## 3. Input → recommendation mapping

| Input | Severity rule | Action | Framework reference |
|---|---|---|---|
| `controlCoverage` | `critical` if 0%, `high` if <50%, else `medium` | "Implement the remaining unimplemented controls." | ISO 27001 Annex A |
| `riskAssessmentCoverage` | `critical` if 0%, `high` if <50%, else `medium` | "Run a risk assessment for every identified risk." | NIST CSF ID.RA |
| `evidenceCompleteness` | `critical` if 0%, `high` if <50%, else `medium` | "Submit and get approval on outstanding evidence." | SOC 2 CC7 |
| `frameworkCoverage` | `medium` | "Map remaining controls to the project's assigned framework." | Project's assigned framework |
| `ownershipCompleteness` | `medium` | "Assign an owner to every control." | ISO 27001 A.5.2 |
| `reviewCompletion` | `medium` | "Resolve pending evidence reviews (approve or reject)." | SOC 2 CC7 |
| `vendorAssessmentCoverage` | `high` if <50%, else `medium` | "Complete a risk assessment for every active vendor." | NIST CSF ID.SC |

Severity thresholds intentionally treat the three highest-weighted, most foundational
inputs (controls, risk assessment, evidence) as `critical`/`high`-capable, since a project
missing those entirely has no governance program at all — the other four are real gaps but
never block the program from existing.

`confidence` is fixed at `1.0` for every recommendation in this engine: each one names an
exact, countable gap read directly from the same live data the score itself is computed
from (e.g. "Control coverage is 40%"), so there is no uncertainty to express — contrast
with `CoachService`'s replies, which carry varying confidence because they're broader,
rule-based judgments rather than direct counts.

## 4. Relationship to the Governance Scoring Engine

The Health Advisor does not compute anything the scoring engine doesn't already compute —
it is a direct re-presentation of the same seven inputs as actions instead of percentages.
Acting on a recommendation (implementing a control, completing a risk assessment,
approving evidence, mapping a framework, assigning an owner, resolving a review, completing
a vendor assessment) moves the corresponding input upward on the next `calculateScore` call,
which moves the overall weighted score — there is no separate "recommendation effectiveness"
model, the scoring engine itself is the feedback loop.

## 5. Milestone / progression tracking

The five health states (Foundation/Visibility/Control/Managed/Optimized, defined in
`governance-scoring-engine.md` Section 3) are the product's progression milestones. Each
call to `GovernanceService.recordScoreSnapshot(context, projectId)` persists the current
score and explanation as a row in the existing `governance_scores` table (previously
defined in schema, never written to), giving the project a real, queryable history of
score-over-time rather than only the current live value.
`GovernanceService.getScoreHistory(context, projectId)` reads that history back in
chronological order, so a project's movement between health states (e.g. Visibility →
Control after a batch of controls were implemented) is a real, persisted fact, not an
inferred one.

## 6. Where this is implemented

`GovernanceService.runHealthAdvisor`, `GovernanceService.recordScoreSnapshot`, and
`GovernanceService.getScoreHistory` in `packages/services/src/GovernanceService.ts`.
Surfaced on `apps/web/app/projects/[id]/page.tsx` as a real "Health Advisor" section
(ranked recommendations) and "Score History" section (persisted snapshots).
