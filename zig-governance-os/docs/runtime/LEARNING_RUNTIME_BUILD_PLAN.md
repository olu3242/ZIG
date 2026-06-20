# Learning Runtime Build Plan

## Purpose
Prioritizes implementation order across the Wave 1-13 specs, per the Batch 51-70 success
criterion: a learner should be able to go Career → Lessons → Visual Objects → Labs → AI
Coaching → Artifacts → Portfolio → Simulations → Certifications without leaving Zig. This
plan sequences that journey by what's buildable today versus what's blocked on a service
decision.

## Priority order

| # | Build | Spec | Blocked on |
|---|---|---|---|
| 1 | Dashboard | Aggregates `LEARNING_RUNTIME_ANALYTICS.md` Progress/Completion metrics | Nothing — `LearningService` data is sufficient |
| 2 | Lesson Player | `LEARNING_RUNTIME_VISUAL_COMPONENTS.md` (`<DiagramViewer />`, `<WorkflowViewer />`, etc.) + `LearningService` | Nothing |
| 3 | Lab Workspace | `LEARNING_RUNTIME_LAB_RUNTIME.md` | Lab attempt persistence (`LEARNING_RUNTIME_STATE_MODEL.md` gap) — UI can be built against mocked submission state first |
| 4 | Scenario Viewer | `LEARNING_RUNTIME_SCENARIO_RUNTIME.md` | Nothing for Org Chart/Assets/Risks/Controls; Vendor/Incident sections degrade gracefully per documented gaps |
| 5 | Artifact Builder | `LEARNING_RUNTIME_ARTIFACT_BUILDER.md` | Export-library choice (out of scope, deferred) |
| 6 | Portfolio Viewer | `LEARNING_RUNTIME_PORTFOLIO_RUNTIME.md` | Certifications/Career Readiness sections render partial until Wave 9/10 gaps close |
| 7 | Zara Coach | `LEARNING_RUNTIME_AI_GUIDED_LEARNING.md` | No `CoachService` — ships first as static persona-driven guidance, not live generation |
| 8 | Certification Center | `LEARNING_RUNTIME_CERTIFICATION_ENGINE.md` | Competency Scoring/Track Completion buildable now; Certificate Issuance blocked on persistence decision |

## Explicit exclusions from this build plan
`<AssessmentEngine />` and `<CareerMode />` are not sequenced into priorities 1-8. Per
`LEARNING_RUNTIME_STATE_MODEL.md` and `LEARNING_RUNTIME_CAREER_OS.md`, both require an
upstream decision before implementation can start: `AssessmentEngine` needs the
`AssessmentService`-vs-extend-`LearningService` decision; `CareerMode` needs a
`docs/product/prd.md` justification as a 12th module under CLAUDE.md's module-addition
rule. Building either now would violate "never implement before documenting."

## Dependency notes
- Priorities 1-2 require no new decisions and can start immediately.
- Priority 3 can start in parallel with 1-2 if lab UI is built against a mocked submission
  shape, but should not persist real learner scores until the state-model gap is resolved.
- Priority 7 (Zara Coach) should ship in its static form alongside priorities 1-4, not
  wait for a `CoachService` — the spec explicitly separates static-guidance capabilities
  from live-generation capabilities for this reason.

## What this wave does NOT do
Does not implement any priority. Does not resolve the `AssessmentService`, `CoachService`,
or Career Mode PRD-justification gaps — sequencing them out of the build plan is the
explicit resolution: they are next-decision items, not next-build items.
