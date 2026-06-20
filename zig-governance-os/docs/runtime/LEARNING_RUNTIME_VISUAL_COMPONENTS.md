# Learning Runtime Visual Components

## Purpose
Wave 2 implementation-ready specification for the five highest-priority components named
in `INTERACTIVE_RENDERING_SPEC.md`'s component table and indexed in
`LEARNING_RUNTIME_COMPONENTS.md`: `<DiagramViewer />`, `<WorkflowViewer />`,
`<RiskHeatmap />`, `<FrameworkCrosswalk />`, `<OrgChart />`. This doc adds the prop
shapes, capability-by-capability data wiring, and static-vs-dynamic boundary that
`INTERACTIVE_RENDERING_SPEC.md` deliberately left at "data source (existing
service/type)" granularity. It does not redefine or contradict that spec's `dataSource`
column — every binding below traces back to the same row.

## Governing constraint (inherited)
Per `LEARNING_RUNTIME_ARCHITECTURE.md`, no new services, tables, or routes are
introduced. Every dynamic capability below calls one of the 12 confirmed services in
`packages/services/src/*.ts`. Confirmed method signatures used in this doc:

| Service | Method | Signature |
|---|---|---|
| `RiskService` | `findAssessments` | `(context: TenantContext, riskId: string) => Promise<RiskAssessmentRecord[]>` |
| `ControlService` | `findMappings` | `(context: TenantContext, sourceControlId: string) => Promise<ControlMappingRecord[]>` |
| `FrameworkService` | `findAvailableFrameworks` | `(context: TenantContext) => Promise<FrameworkRecord[]>` |
| `UserService` | `findById` / `findMany` (inherited from `BaseService`) | `(context, id) => Promise<UserRecord \| null>` / `(context) => Promise<UserRecord[]>` |

No `AIExplanationService`, `CoachService`, or similar exists. Any capability described as
"AI explanation" or "AI recommendation" below is backed either by static, pre-written
content sourced from `docs/coaching/ZARA_PERSONA.md`, or is explicitly flagged as a gap.
No such service is invented here.

---

## 1. `<DiagramViewer />`

Renders any entry from `DIAGRAM_LIBRARY.md`.

```ts
interface DiagramViewerProps {
  assetName: string;                 // exact entry name from DIAGRAM_LIBRARY.md
  mode: "static" | "interactive";
  diagramConfig: DiagramConfig;      // static config, resolved from DIAGRAM_LIBRARY.md + docs/learning/assets/<track>/<asset>.md
  initialZoom?: number;              // default 1.0
  initialPan?: { x: number; y: number };
  onHotspotSelect?: (hotspotId: string) => void;
  className?: string;
}

interface DiagramConfig {
  nodes: Array<{
    id: string;
    label: string;
    order: number;                   // lifecycle/flow sequence position
    hotspot?: {
      tooltip: string;               // short static explanation
      explanation?: ZaraExplanationRef; // see "AI explanations" below
    };
  }>;
  edges: Array<{ from: string; to: string; label?: string }>;
}

interface ZaraExplanationRef {
  source: "docs/coaching/ZARA_PERSONA.md";
  persona: "Instructor";             // Instructor is the persona that "explains diagrams" per ZARA_PERSONA.md
  staticText: string;                // pre-written explanation, authored at content time, not generated at runtime
}
```

| Capability | Backing | Static or dynamic |
|---|---|---|
| Zoom | Client-side transform state (`initialZoom`, scroll/pinch handlers) | Dynamic (client state only, no service call) |
| Pan | Client-side transform state (`initialPan`, drag handlers) | Dynamic (client state only, no service call) |
| Hotspots | `DiagramConfig.nodes[].hotspot`, resolved from the asset's detail file under `docs/learning/assets/<track>/` | Static — content authored ahead of render, no service call |
| Tooltips | `hotspot.tooltip` string, same source as hotspots | Static |
| "AI explanations" | `hotspot.explanation` — a `ZaraExplanationRef` pointing at pre-written Instructor-persona text from `ZARA_PERSONA.md`'s "Explain diagrams" capability | **Static, not AI-generated.** No `CoachService` exists. This is canned guidance authored per asset, served verbatim. A future `CoachService` could replace `staticText` with a generated explanation without changing this prop shape — flagged as a forward-compat seam, not built here. |

No service call exists for `<DiagramViewer />` today — it is fully static-config-only,
consistent with `INTERACTIVE_RENDERING_SPEC.md`'s row for this component.

---

## 2. `<WorkflowViewer />`

Renders any entry from `WORKFLOW_LIBRARY.md`.

```ts
interface WorkflowViewerProps {
  assetName: string;                 // exact entry name from WORKFLOW_LIBRARY.md
  mode: "static" | "interactive";
  workflowConfig: WorkflowConfig;     // static config from WORKFLOW_LIBRARY.md + asset detail file
  onStepComplete?: (stepId: string, decision?: string) => void;
  onWorkflowComplete?: (trace: WorkflowTrace) => void;
}

interface WorkflowConfig {
  steps: Array<{
    id: string;
    order: number;
    label: string;
    description: string;
    decision?: {
      prompt: string;
      options: Array<{ id: string; label: string; leadsTo: string /* step id */ }>;
    };
  }>;
}

interface WorkflowTrace {
  // client-only state, not persisted by any service in this wave
  stepsVisited: string[];
  decisionsMade: Record<string /* stepId */, string /* optionId */>;
  completedAt: string; // ISO timestamp, client clock
}
```

| Capability | Backing | Static or dynamic |
|---|---|---|
| Step navigation | `WorkflowConfig.steps`, ordered by `order` | Static config; navigation index is client state |
| State tracking | `WorkflowTrace`, held in client component state (e.g. React state/reducer) for the duration of the session | Dynamic in the sense that it changes per interaction, but **not** backed by any service — no `LabService`/`AssessmentService` exists to persist it. If persisted, it must go through `LearningService`'s `LearningPathRecord` node state (per `LEARNING_RUNTIME_STATE_MODEL.md`'s "Lesson" row) — this doc does not invent new persistence. |
| Interactive decisions | `WorkflowConfig.steps[].decision`, authored statically per asset | Static — decision branches are pre-defined, not computed |

`<WorkflowViewer />` has no live `dataSource`, matching `INTERACTIVE_RENDERING_SPEC.md`.
If a workflow's step completion should mark a lesson complete, the integration point is
`LearningService` (existing), invoked by the page shell wrapping this component — not by
the component itself.

---

## 3. `<RiskHeatmap />`

Renders `HEATMAP_LIBRARY.md` risk heatmaps and scenario Risk Landscape Maps.

```ts
interface RiskHeatmapProps {
  assetName: string;                       // entry name from HEATMAP_LIBRARY.md
  mode: "static" | "interactive";
  dataSource: {
    riskId: string;                        // scopes which risk's assessments to fetch
  };
  matrixConfig?: HeatmapMatrixConfig;       // static axis/quadrant labels, NOT risk data itself
  onRiskPlot?: (riskId: string, likelihood: number, impact: number) => void;
}

interface HeatmapMatrixConfig {
  likelihoodLabels: string[];   // e.g. ["Rare","Unlikely","Possible","Likely","Almost Certain"]
  impactLabels: string[];       // e.g. ["Negligible","Minor","Moderate","Major","Severe"]
  quadrantThresholds: { low: number; medium: number; high: number };
}

// Fetched, not authored:
// RiskAssessmentRecord[] via RiskService.findAssessments(context, dataSource.riskId)
```

| Capability | Backing service call | Static or dynamic |
|---|---|---|
| Dynamic scoring | `RiskService.findAssessments(context, riskId)` → `RiskAssessmentRecord[]`; component plots `likelihood`/`impact` fields from the latest assessment record | Dynamic — real service call, per `INTERACTIVE_RENDERING_SPEC.md` row for `<RiskHeatmap />` |
| Hover explanations | Static tooltip text templated from the fetched `RiskAssessmentRecord` fields (e.g. "Scored {likelihood}x{impact} on {assessedAt} — rationale: {rationale}") | Dynamic data, static template — no AI involved, just field interpolation |
| "AI recommendations" | Pre-written guidance keyed off score band (e.g. quadrant "high"), sourced from `ZARA_PERSONA.md`'s Auditor persona behavior ("challenges any risk plotted without likelihood/impact justification") | **Static, not AI-generated.** No `CoachService`/`AIExplanationService` exists. The component selects from a small static lookup table of pre-authored recommendation strings keyed by quadrant + whether `rationale` is empty on the fetched record — it does not call any AI service. |

Axis labels and quadrant thresholds (`matrixConfig`) are static config, matching
`HEATMAP_LIBRARY.md`'s authored matrix shape — only the plotted points are dynamic.

---

## 4. `<FrameworkCrosswalk />`

Renders `FRAMEWORK_MAP_LIBRARY.md` crosswalks (ISO 27001 ↔ NIST CSF ↔ SOC 2) and scenario
Compliance/Control Coverage Maps.

```ts
interface FrameworkCrosswalkProps {
  assetName: string;                      // entry name from FRAMEWORK_MAP_LIBRARY.md
  mode: "static" | "interactive";
  dataSource: {
    sourceControlId?: string;             // when set, fetches this control's mappings
    frameworksInScope?: string[];         // framework codes to display, e.g. ["ISO27001","NIST_CSF","SOC2"]
  };
  onControlSelect?: (controlId: string) => void;
  onGapHighlight?: (gap: CrosswalkGap) => void;
}

interface CrosswalkGap {
  frameworkCode: string;
  clauseId: string;
  reason: "no_mapping" | "partial_mapping";
}

// Fetched, not authored:
// ControlMappingRecord[] via ControlService.findMappings(context, dataSource.sourceControlId)
// FrameworkRecord[] via FrameworkService.findAvailableFrameworks(context)
```

| Capability | Backing service call | Static or dynamic |
|---|---|---|
| ISO ↔ NIST ↔ SOC 2 mapping | `ControlService.findMappings(context, sourceControlId)` → `ControlMappingRecord[]`, joined client-side against `FrameworkService.findAvailableFrameworks(context)` → `FrameworkRecord[]` to render the cross-framework grid | Dynamic |
| Dynamic mapping (select-a-control-to-highlight) | Re-filters the already-fetched `ControlMappingRecord[]` client-side on `onControlSelect`; no re-fetch needed per click, matching `INTERACTIVE_LEARNING_OBJECTS.md`'s "Interactive Framework Map" object ("client-side manipulation of already-fetched data, not a new data source") | Dynamic data, client-side recompute |
| Gap highlighting | Computed client-side: for each `FrameworkRecord` in `dataSource.frameworksInScope`, flag any clause with zero matching `ControlMappingRecord` as `"no_mapping"` | Dynamic — derived from fetched data, no separate gap-detection service |

`FRAMEWORK_MAP_LIBRARY.md`'s static asset (the library entry's title/description/legend)
remains static config; only the actual mapping rows and gap computation are live.

---

## 5. `<OrgChart />`

Renders `ORG_CHART_LIBRARY.md` entries and scenario Organization Charts.

```ts
interface OrgChartProps {
  assetName: string;                 // entry name from ORG_CHART_LIBRARY.md
  mode: "static" | "interactive";
  orgConfig: OrgChartConfig;         // static hierarchy, resolved from ORG_CHART_LIBRARY.md + asset detail file
  dataSource?: {
    resolveRealOwners?: boolean;     // optional future-integration flag, see below
  };
  onNodeExpand?: (roleId: string) => void;
  onNodeSelect?: (roleId: string) => void;
}

interface OrgChartConfig {
  roles: Array<{
    id: string;
    title: string;
    reportsTo?: string;              // role id of direct manager, undefined = top of chart
    decisionRights?: string;         // static text describing scope, per docs/learning/ORG_CHART_LIBRARY.md
    currentOwnerName?: string;       // static, scenario-authored name (e.g. "CloudPay CISO: J. Alvarez")
    currentOwnerUserId?: string;     // OPTIONAL real user id — only set when dataSource.resolveRealOwners is true
  }>;
}
```

| Capability | Backing | Static or dynamic |
|---|---|---|
| Expand/collapse | Client-side tree expand state, derived from `reportsTo` adjacency in `orgConfig.roles` | Dynamic (client state only, no service call) |
| Role details | `roles[].decisionRights`, static text from `ORG_CHART_LIBRARY.md` / scenario doc | Static |
| Reporting relationships | `roles[].reportsTo` adjacency, static | Static |
| Real role assignment (future integration point) | `UserService.findById(context, currentOwnerUserId)` — only invoked when `dataSource.resolveRealOwners === true` and a role has `currentOwnerUserId` set | **Not active by default.** `INTERACTIVE_RENDERING_SPEC.md` names `UserService` as a "future integration point," not a current binding. This wave keeps that flag off by default (`currentOwnerName` static string is what scenario org charts use today, per `docs/scenarios/*.md`); the prop exists so a later wave can flip it on without a breaking prop change. |

`<OrgChart />` remains static-config-only by default, exactly matching
`INTERACTIVE_RENDERING_SPEC.md`'s row — the `dataSource.resolveRealOwners` flag is an
explicitly inert seam, not an implemented dynamic path.

---

## Cross-component notes

- **Component contract conformance**: all five props interfaces above satisfy
  `INTERACTIVE_RENDERING_SPEC.md`'s base contract (`assetName`, `mode`,
  optional `dataSource`) and add no field that contradicts it.
- **Explainability**: per CLAUDE.md, any value derived from a service call that feeds an
  AI-adjacent display (none of the five components call an AI service directly in this
  wave) must carry reason/confidence/framework-reference metadata. Since "AI
  explanations"/"AI recommendations" here are static ZARA-sourced text, not live AI
  output, no confidence score is attached — the text itself states its source
  (`ZARA_PERSONA.md`, named persona) instead of a generated confidence number. A future
  `CoachService`-backed version would need to add a confidence field to
  `ZaraExplanationRef` at that time.
- **Charting library**: not chosen here, per `INTERACTIVE_RENDERING_SPEC.md`'s and
  `LEARNING_RUNTIME_PREPARATION.md`'s explicit deferral. Prop shapes above are
  library-agnostic (plain data in, callback out).

## What this wave does NOT do
- Does not implement any of the five components in code.
- Does not create `CoachService`, `AIExplanationService`, or any AI-backed runtime
  service — every "AI explanation"/"AI recommendation" capability above is either static
  content sourced from `docs/coaching/ZARA_PERSONA.md` or explicitly marked inert
  (`OrgChart`'s `resolveRealOwners` seam).
- Does not choose a diagramming/charting library (D3, react-flow, vis.js, etc.).
- Does not add persistence for `WorkflowTrace`, hotspot interaction history, or any other
  client-only state — if persistence is needed later, it must route through
  `LearningService`'s existing `LearningPathRecord` shape per
  `LEARNING_RUNTIME_STATE_MODEL.md`, not a new table.
- Does not modify `INTERACTIVE_RENDERING_SPEC.md`'s `dataSource` column — every binding
  above is additive detail on the same row, not a redefinition.
- Does not cover the other 8 components from `INTERACTIVE_RENDERING_SPEC.md`'s table
  (`<ControlMatrix />`, `<AuditTimeline />`, `<DecisionTree />`, `<ArchitectureViewer />`,
  `<ScenarioViewer />`, `<VendorMap />`, `<ComplianceDashboard />`, `<IncidentFlow />`) —
  `<ScenarioViewer />` is specified separately in
  `LEARNING_RUNTIME_SCENARIO_RUNTIME.md`; the rest are out of scope for Wave 2.
