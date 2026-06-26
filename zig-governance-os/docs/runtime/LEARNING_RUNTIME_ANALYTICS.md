# Learning Runtime Analytics

## Purpose
Implementation-ready spec for `<LearningAnalytics />` (Wave 11): Progress, Completion,
Skills, Artifacts, Scenario Performance, Assessment Scores, Certification Readiness. This
is a read-only rollup surface — no new service, table, or route.

## Data sources per metric

| Metric | Source | Computation |
|---|---|---|
| Progress | `LearningService.findMany` + `LearningService.findModules` per `LearningPathRecord` | `completedModules / totalModules` per path, per learner |
| Completion | Same as Progress, aggregated across all paths in a track | `completedPaths / totalPaths` per track |
| Skills | Derived from completed `LearningModuleRecord`s' tagged competencies (per lesson metadata, not a separate table) | Rollup of distinct skill tags across completed modules |
| Artifacts | `ARTIFACT_CREATED` event stream (`LEARNING_RUNTIME_EVENTS.md`) | Count + most-recent-by-type, per learner |
| Scenario Performance | `ScenarioService` + lab scoring (per `LEARNING_RUNTIME_LAB_RUNTIME.md`, itself blocked on the same state-model gap as labs) | Average lab score per scenario, per learner — **partially blocked**: scoring data has no confirmed persistence yet |
| Assessment Scores | **Blocked.** No `AssessmentService` exists (see `LEARNING_RUNTIME_STATE_MODEL.md`). This metric renders an honest empty/gap state until that service is decided. | N/A |
| Certification Readiness | Computed live from Progress + Completion + Skills (no certificate persistence needed for *readiness*, only for *issuance* — see `LEARNING_RUNTIME_CERTIFICATION_ENGINE.md`) | Weighted readiness score; weighting scheme is a Wave 10 decision, referenced not redefined here |

## Props

```tsx
interface LearningAnalyticsProps {
  learnerId: string;
  trackId?: string; // omit for cross-track view
  metrics: Array<
    | "progress"
    | "completion"
    | "skills"
    | "artifacts"
    | "scenarioPerformance"
    | "assessmentScores"
    | "certificationReadiness"
  >;
}
```

## Event-driven refresh
Every metric above is a rollup over the event vocabulary defined in
`LEARNING_RUNTIME_EVENTS.md` (`LESSON_COMPLETED`, `LAB_COMPLETED`, `ASSESSMENT_COMPLETED`,
`ARTIFACT_CREATED`, `SCENARIO_COMPLETED`, `CERTIFICATION_AWARDED`). `<LearningAnalytics />`
does not maintain its own derived-state table — it recomputes from the underlying services
on read, consistent with `<PortfolioViewer />`'s read-only model in
`LEARNING_RUNTIME_PORTFOLIO_RUNTIME.md`.

## What this wave does NOT do
Does not implement the component. Does not create an analytics table, warehouse, or
caching layer. Does not resolve the Assessment Scores or Scenario Performance persistence
gaps — both are inherited from earlier waves and not re-litigated here.
