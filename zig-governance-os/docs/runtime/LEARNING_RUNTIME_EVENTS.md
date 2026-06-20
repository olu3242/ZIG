# Learning Runtime Events

## Purpose
Defines the runtime event vocabulary (Wave 12 of the Batch 51-70 spec), pulled forward
into the foundation wave because every other runtime doc references these event names.
This is an event *contract* (name, trigger, payload shape), not an event-bus
implementation — no message queue, table, or service is created by this document.

## Events

| Event | Emitted when | Payload (conceptual) | Emitted by |
|---|---|---|---|
| `LESSON_STARTED` | Learner opens a lesson node | `{ learnerId, lessonId, trackId, timestamp }` | Lesson Player (Wave 14 priority #2) |
| `LESSON_COMPLETED` | `LearningService` marks a node `completed` | `{ learnerId, lessonId, trackId, timestamp }` | Lesson Player |
| `LAB_STARTED` | Learner opens `<LabWorkspace />` | `{ learnerId, labId, scenarioId, timestamp }` | `<LabWorkspace />` |
| `LAB_COMPLETED` | Learner submission is scored | `{ learnerId, labId, scenarioId, score, timestamp }` | `<LabWorkspace />` |
| `ASSESSMENT_COMPLETED` | An assessment attempt is scored | `{ learnerId, assessmentId, score, timestamp }` | `<AssessmentEngine />` — **blocked on `AssessmentService` gap; event contract defined, emitter does not exist yet** |
| `ARTIFACT_CREATED` | Learner exports/saves an artifact | `{ learnerId, artifactType, projectId, timestamp }` | `<ArtifactBuilder />` |
| `PORTFOLIO_UPDATED` | Any of the above changes the learner's portfolio composition | `{ learnerId, timestamp }` | `<PortfolioViewer />` (recomputes on read; this event is for analytics subscribers, not state mutation) |
| `SCENARIO_COMPLETED` | All required sections of a scenario's labs/assessments are done | `{ learnerId, scenarioId, timestamp }` | `<ScenarioViewer />` |
| `CERTIFICATION_AWARDED` | Certificate issuance | `{ learnerId, trackId, certificateId, timestamp }` | `<CertificationCenter />` — **blocked on certificate-persistence gap; event contract defined, emitter does not exist yet** |

## Consumers
`<LearningAnalytics />` (Wave 11) is the primary consumer of every event above — its
metrics (Progress, Completion, Skills, Artifacts, Scenario Performance, Assessment Scores,
Certification Readiness) are direct rollups of this event stream, not a separately
maintained dataset.

## Transport
Not specified here. Whether these events ride an existing mechanism in `apps/web`/`apps/api`
or require a new lightweight event bus is an implementation-time decision for whoever
builds Wave 14 priority #1 — this document fixes the event *names and payloads* so that
decision doesn't also have to invent vocabulary.

## What this wave does NOT do
Does not implement an event bus, queue, or webhook. Does not create new tables for event
storage. Does not resolve the two blocked emitters.
