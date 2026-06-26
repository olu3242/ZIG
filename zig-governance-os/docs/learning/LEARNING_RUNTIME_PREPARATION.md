# Learning Runtime Preparation

## Purpose
Summarizes what's now in place to prepare Zig for Batch 51-60 (Learning Runtime, Diagram
Renderer, Framework Renderer, Heatmap Renderer, Scenario Viewer, Portfolio Viewer, AI
Guided Labs) — and what that next wave still needs to decide or build.

## What's ready for the runtime to consume
- **39 named, indexed visual assets** across 8 tracks, each with a content spec (purpose,
  structure, backing data) in `docs/learning/assets/<track>/`.
- **7 index libraries** mapping every asset to the lesson(s) that use it — the runtime can
  resolve "this lesson needs X" to "X is defined here" without ambiguity.
- **13 component contracts** in `INTERACTIVE_RENDERING_SPEC.md`, each naming its real data
  source (existing service/type) or marking itself static-config-only.
- **8 interactive object specs** in `docs/learning/interactive/INTERACTIVE_LEARNING_OBJECTS.md`
  describing the manipulable layer on top of the static components.
- **5 scenarios**, each with 8 visual sections populated or honestly marked as gaps — the
  `<ScenarioViewer />` component's composite view has a real, finite set of sections to
  render per scenario.
- **ZARA visual coaching contract** in `docs/coaching/ZARA_PERSONA.md`'s "Visual
  integration" section — defines what the AI Guided Labs wave's coaching feedback needs to
  reference.

## What Batch 51-60 still needs to decide (explicitly out of scope here)
1. **Charting/diagramming library choice** (e.g. D3, react-flow, vis.js) — not chosen in
   this wave.
2. **The 9 flagged-as-new assets'** permanent home in their target index library (listed
   in `INTERACTIVE_ASSET_INVENTORY.md`) — should be resolved before or during runtime
   build, not deferred indefinitely.
3. **`IncidentService`** — does not exist; every scenario's Incident Flow section is a
   documented gap. The runtime's `<IncidentFlow />` component has no live data source
   until this is built or scoped as out of bounds.
4. **Vendor-as-asset modeling** — `<VendorMap />` depends on `AssetService` standing in for
   a dedicated vendor entity (per `docs/artifacts/VENDOR_ASSESSMENT.md`'s documented gap).
   Confirm this modeling choice survives into the runtime before building against it.

## Non-negotiables carried forward unchanged
No new tables, services, or routes were created in Batches 41-60. Every `dataSource` named
in `INTERACTIVE_RENDERING_SPEC.md` is a service confirmed to exist on `main`
(`RiskService`, `ControlService`, `FrameworkService`, `AuditService`, `ScenarioService`,
`GovernanceService`, `AssetService`). The runtime wave inherits this constraint — it should
build rendering and interaction on top of these services, not introduce parallel ones.

## What this wave does NOT do
Does not begin Batch 51-60. This document is the handoff point.
