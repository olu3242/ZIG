# Interactive Rendering Specification

## Purpose
Defines the frontend component contract that will eventually render the visual and
interactive assets indexed across the 7 libraries and `docs/learning/interactive/`. This
is a specification for Batch 51-60 ("Learning Runtime, Diagram Renderer, Framework
Renderer, Heatmap Renderer, Scenario Viewer, Portfolio Viewer, AI Guided Labs") — no
component below is implemented in this wave, per "never implement before documenting."

## Components

| Component | Renders | Data source (existing service/type, no new ones) |
|---|---|---|
| `<DiagramViewer />` | Any entry from `DIAGRAM_LIBRARY.md` (lifecycle/flow/architecture diagrams) | Static config (step labels + order) — no live data |
| `<WorkflowViewer />` | Any entry from `WORKFLOW_LIBRARY.md` | Static config (step labels + order) — no live data |
| `<RiskHeatmap />` | `HEATMAP_LIBRARY.md` risk heatmaps, scenario Risk Landscape Maps | `RiskService.findAssessments` → `RiskAssessment[]` |
| `<FrameworkCrosswalk />` | `FRAMEWORK_MAP_LIBRARY.md` crosswalks, scenario Compliance/Control Coverage Maps | `ControlService.findMappings` → `ControlMapping[]`, `FrameworkService` records |
| `<ControlMatrix />` | `FRAMEWORK_MAP_LIBRARY.md` Control Coverage Matrix | `ControlService.findMappings` → `ControlMapping[]` |
| `<AuditTimeline />` | `TABLE_LIBRARY.md` Audit Timeline, scenario Audit History Timelines | **Gap.** `AuditService` only exposes `recordAction` against an activity-log sink — it has no read path for `Audit` records (phases, starts/ends, owners, milestones). Renders as static config only until an audit-engagement read service/repository exists; do not wire to `AuditService`. |
| `<DecisionTree />` | Any entry from `DECISION_TREE_LIBRARY.md` | Static config (branch labels + conditions) — no live data |
| `<OrgChart />` | `ORG_CHART_LIBRARY.md` entries, scenario Organization Charts | Static config (role hierarchy) — no live data; future integration point is `UserService` for real role assignment |
| `<ArchitectureViewer />` | Scenario Technology Architecture Diagrams | Static config (node/edge list) — no live data |
| `<ScenarioViewer />` | Composite: renders all of a scenario's visual sections (org chart, architecture, vendor map, risk map, compliance map, control map, incident flow, audit timeline) in one screen | `ScenarioService`, `simulated_company_objects` |
| `<VendorMap />` | `HEATMAP_LIBRARY.md` Vendor Risk Heatmap, `TABLE_LIBRARY.md` Vendor Tier Matrix | `AssetService` (vendor modeled as asset, per `docs/artifacts/VENDOR_ASSESSMENT.md`'s documented gap), `RiskService.findAssessments` |
| `<ComplianceDashboard />` | Scenario Compliance Coverage Maps, `GovernanceService` readiness data | `FrameworkService`, `GovernanceService.findRecommendations` |
| `<IncidentFlow />` | `DIAGRAM_LIBRARY.md` Incident Lifecycle, scenario Incident Flow sections | Static config for lifecycle stages; live data source flagged as a gap (no `IncidentService` exists today, same as noted in each scenario's "Incident Flow" section) |

## Component contract (shape every component follows)
Every component above accepts:
- `assetName: string` — the exact named entry from the relevant library doc, so the
  component can be data-driven by the library rather than hardcoded per-lesson.
- `mode: "static" | "interactive"` — static renders the asset as a fixed image-equivalent;
  interactive enables the manipulation described in `INTERACTIVE_LEARNING_OBJECTS.md`.
- `dataSource?` — optional, only present for components with a real backing service (see
  table above); omitted for the four static-config-only components (`DiagramViewer`,
  `WorkflowViewer`, `DecisionTree`, `OrgChart`, `ArchitectureViewer`).

## Explainability requirement
Per CLAUDE.md, any component rendering AI-influenced data (e.g. `<ComplianceDashboard />`
showing `GovernanceService` readiness) must surface the same reason/confidence/framework
reference the underlying recommendation already carries — the component does not strip
explainability metadata when rendering visually.

## What this wave does NOT do
- Does not implement any component, library, or rendering pipeline.
- Does not choose a charting/diagramming library (e.g. D3, react-flow) — that decision
  belongs to the Batch 51-60 implementation wave, not this spec.
- Does not add new services, routes, or schema. Every `dataSource` above is a service
  confirmed to exist on `main` today.
