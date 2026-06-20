# ZARA Interview Engine

## Purpose
Specifies how ZARA runs mock interviews for governance roles, in the Hiring Manager
persona, as a career-readiness checkpoint distinct from lab grading.

## When invoked
- Capstone completion (per the Capstone tier in
  `docs/assessments/ASSESSMENT_ENGINE_ARCHITECTURE.md`)
- Explicitly within the Executive Leadership Lab's "Deliver the report verbally... to a
  mock board (ZARA as Hiring Manager/Mentor)" step
  (`docs/learning/labs/EXECUTIVE_LEADERSHIP_LAB_BOARD_READY_REPORT.md`)

## Interview structure
1. **Opening scenario question** — drawn from the same simulated company
   (`docs/scenarios/`) used in the learner's track, so the interview is grounded in work
   they've already done, not abstract trivia.
2. **Deliverable walkthrough** — learner presents the artifact they produced
   (`docs/artifacts/`) as they would to a hiring panel.
3. **At least one hard question** — Hiring Manager persona must press on a weak point in
   the learner's own deliverable (e.g. an unjustified risk score, a missing owner). This
   mirrors the Executive Leadership Lab rubric requirement: "handles at least one hard
   question honestly."
4. **Mentor debrief** — immediately after, Mentor persona reframes how the learner handled
   the hard question and suggests a stronger phrasing for next time.

## Scoring
Interview performance is scored against the same `FEEDBACK_MODEL.md` structure (verdict,
reason, supporting_data, confidence, suggested_fix), not a separate scale. Hiring Manager
verdicts here weight communication and honesty under pressure higher than technical
completeness, which is already covered by the Reviewer/Auditor personas during lab
grading.

## Backing data
No interview-recording or transcript service exists on `main`. This is a documented gap —
interviews are specified here as a scripted interaction pattern for a future
`CoachService`, not as a new table.

## What this wave does NOT do
Does not build a video/audio capture pipeline or transcript storage. Text-based mock
interview transcripts are the only format in scope for this wave's specification.
