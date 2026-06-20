# Learning Runtime Architecture

## Purpose
Defines how the documented Learning OS content (curriculum, lessons, labs, assessments,
artifacts, visual/interactive asset libraries, scenario visual operating system) becomes a
running product surface in `apps/web`, without introducing a parallel architecture to the
one already documented in `docs/architecture/` and `packages/services/`.

## Governing constraint
No new services, tables, schemas, or routes are introduced by this wave. Every runtime
component specified under `docs/runtime/` and in the Wave 2-11 component specs reads from
one of the 9 services confirmed to exist in `packages/services/src/`: `AssetService`,
`AuditService`, `ControlService`, `EvidenceService`, `FrameworkService`,
`GovernanceService`, `LearningService`, `RiskService`, `ScenarioService`. Where a wave's
requested feature implies a service that does not exist (`AssessmentService`,
`VendorService`, `IncidentService`, `CoachService`, `CertificationService`,
`PortfolioService`, `ArtifactService`, `AnalyticsService` — none are present in
`packages/services/src/*.ts` as of this wave), this is documented as an explicit
prerequisite gap in that wave's spec rather than invented.

## Layering
```
Content layer       (docs/learning/* — already complete: libraries, lessons, labs,
                      assessments, artifacts, scenarios, ZARA persona)
        ↓
Runtime data layer   (existing services — LearningService, ScenarioService,
                      GovernanceService, RiskService, ControlService, AuditService,
                      EvidenceService, FrameworkService, AssetService)
        ↓
Runtime component layer (Wave 2-11 specs: <DiagramViewer />, <ScenarioViewer />,
                      <LabWorkspace />, <AssessmentEngine />, <ArtifactBuilder />,
                      <PortfolioViewer />, <ZaraCoach />, <CareerMode />,
                      <CertificationCenter />, <LearningAnalytics />)
        ↓
Application shell    (apps/web — not yet started; this wave does not start it)
```

## Lesson → Lab → Assessment → Artifact → Portfolio → Certification lifecycle
This is the spine every runtime component must respect. Each stage is a state transition,
not a new entity type:

1. **Lesson** — a `LearningPathRecord` node (via `LearningService`) reaches `completed`.
2. **Lab** — a scenario-backed exercise (via `ScenarioService`) reaches a scored
   `submitted` state. No `LabService` is created; lab state is tracked as described in
   `LEARNING_RUNTIME_STATE_MODEL.md`.
3. **Assessment** — a knowledge check or capstone is scored. **Gap**: no
   `AssessmentService` exists today. This stage's persistence model is documented in
   `LEARNING_RUNTIME_STATE_MODEL.md` as a prerequisite for Wave 5, not implemented here.
4. **Artifact** — a governance document (Risk Register, Audit Plan, etc.) is generated
   from the learner's own project data via the same services a real Zig user would use
   (`RiskService`, `ControlService`, `AuditService`, ...). No artifact-specific service.
5. **Portfolio** — an aggregation view over the learner's completed lessons, labs,
   assessments, and artifacts. Read-only composition, not a new entity.
6. **Certification** — a computed readiness state over the above. **Gap**: no persistence
   layer for issued certificates exists; documented as a Wave 10 prerequisite.

## What this wave does NOT do
Does not write application code. Does not create `apps/web` or `apps/api`. Does not create
any new service, table, or route. Does not resolve the `AssessmentService`/certification
persistence gaps — it names them precisely so Wave 5 and Wave 10 inherit a clear, scoped
decision rather than an ambiguous one.
