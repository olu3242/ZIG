# Learning Runtime Components

## Purpose
Indexes every runtime component named across Waves 2-11, in one place, so a future
implementation session can see the full component surface before starting any one of them.
Per-component capability detail lives in each wave's own spec file (see `Spec` column);
this file is the map, not the content.

## Component index

| Component | Wave | Spec file | Backing service(s) | Status |
|---|---|---|---|---|
| `<DiagramViewer />` | 2 | `LEARNING_RUNTIME_VISUAL_COMPONENTS.md` | Static config + `INTERACTIVE_RENDERING_SPEC.md` data sources | Spec only |
| `<WorkflowViewer />` | 2 | `LEARNING_RUNTIME_VISUAL_COMPONENTS.md` | Static config | Spec only |
| `<RiskHeatmap />` | 2 | `LEARNING_RUNTIME_VISUAL_COMPONENTS.md` | `RiskService.findAssessments` | Spec only |
| `<FrameworkCrosswalk />` | 2 | `LEARNING_RUNTIME_VISUAL_COMPONENTS.md` | `ControlService.findMappings`, `FrameworkService` | Spec only |
| `<OrgChart />` | 2 | `LEARNING_RUNTIME_VISUAL_COMPONENTS.md` | Static config (scenario org data) | Spec only |
| `<ScenarioViewer />` | 3 | `LEARNING_RUNTIME_SCENARIO_RUNTIME.md` | `ScenarioService` | Spec only |
| `<LabWorkspace />` | 4 | `LEARNING_RUNTIME_LAB_RUNTIME.md` | `ScenarioService` + state model (no `LabService`) | Spec only |
| `<AssessmentEngine />` | 5 | `LEARNING_RUNTIME_ASSESSMENT_RUNTIME.md` | `AssessmentService` — **gap, does not exist** | Spec only, blocked |
| `<ArtifactBuilder />` | 6 | `LEARNING_RUNTIME_ARTIFACT_BUILDER.md` | `RiskService`, `ControlService`, `AssetService`, `AuditService`, `EvidenceService` | Spec only |
| `<PortfolioViewer />` | 7 | `LEARNING_RUNTIME_PORTFOLIO_RUNTIME.md` | Read-only aggregation over above services | Spec only |
| `<ZaraCoach />` | 8 | `LEARNING_RUNTIME_AI_GUIDED_LEARNING.md` | `CoachService` — **gap, does not exist**; today's coaching is doc-only (`ZARA_PERSONA.md`) | Spec only, blocked |
| `<CareerMode />` | 9 | `LEARNING_RUNTIME_CAREER_OS.md` | No backing service exists; gap | Spec only, blocked |
| `<CertificationCenter />` | 10 | `LEARNING_RUNTIME_CERTIFICATION_ENGINE.md` | No persistence layer exists; gap | Spec only, blocked |
| `<LearningAnalytics />` | 11 | `LEARNING_RUNTIME_ANALYTICS.md` | Read-only aggregation over `LearningService` + above | Spec only |

## Reading this table
"Spec only" means this wave produced an implementation-ready specification but wrote no
application code. "Spec only, blocked" means the spec additionally had to name a missing
service as a precondition — the component cannot be implemented until that service (or an
explicitly approved alternative, e.g. extending an existing service rather than adding a
new one) is decided and built, consistent with "never implement before documenting."

## What this wave does NOT do
Does not implement any component. Does not create the gap-flagged services. Does not rank
components by priority — that ordering is `LEARNING_RUNTIME_BUILD_PLAN.md`'s job (Wave 14).
