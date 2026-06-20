# Learning Runtime Scenario Runtime

## Purpose
Wave 3 implementation-ready specification for `<ScenarioViewer />`, the composite
component named in `INTERACTIVE_RENDERING_SPEC.md` ("renders all of a scenario's visual
sections... in one screen") and indexed in `LEARNING_RUNTIME_COMPONENTS.md`. Covers the
seven sections a scenario's simulated company exposes: Company Selection, Org Charts,
Assets, Risks, Controls, Vendors, Incidents. Builds directly on the five scenario docs
under `docs/scenarios/*.md` (CloudPay, GovSec, HealthBridge, ManufacturX, RetailNova) and
the per-section gaps each already documents.

## Governing constraint (inherited)
Per `LEARNING_RUNTIME_ARCHITECTURE.md`, no new services, tables, or routes. The backing
service for this component is `ScenarioService`. Confirmed signature from
`packages/services/src/ScenarioService.ts`:

```ts
class ScenarioService extends BaseService<ScenarioRecord> {
  // inherited from BaseService<ScenarioRecord>:
  findById(context: TenantContext, id: string): Promise<ScenarioRecord | null>;
  findMany(context: TenantContext): Promise<ScenarioRecord[]>;
  search(context: TenantContext, term: string, fields: Array<keyof ScenarioRecord>): Promise<ScenarioRecord[]>;

  // own method:
  findRuns(context: TenantContext, scenarioId: string): Promise<ScenarioRunRecord[]>;
}
```

`ScenarioRecord` shape (from `packages/types/src/index.ts`):
```ts
interface Scenario {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  description: string;
  frameworkIds: string[];
}
```

`ScenarioRecord` itself carries no nested assets/risks/controls/vendors/incidents — those
are read separately via `AssetService`, `RiskService`, `ControlService`, and the
documented gap stand-ins below (per `simulated_company_objects`, the table each scenario
doc cites as its seed-data source). `<ScenarioViewer />` is a composition layer, not a
single fetch.

---

## Top-level component

```ts
interface ScenarioViewerProps {
  scenarioId?: string;                 // omitted while on the Company Selection screen
  mode: "static" | "interactive";
  onScenarioSelect?: (scenarioId: string) => void;
  onSectionChange?: (section: ScenarioSection) => void;
}

type ScenarioSection =
  | "company-selection"
  | "org-chart"
  | "assets"
  | "risks"
  | "controls"
  | "vendors"
  | "incidents";

interface ScenarioViewerState {
  activeSection: ScenarioSection;
  scenario: ScenarioRecord | null;
  runs: ScenarioRunRecord[];           // via ScenarioService.findRuns
}
```

`<ScenarioViewer />` renders one of seven section sub-components based on
`activeSection`. Each is specified below with its own props, data source, and gap status.

---

## 1. Company Selection

```ts
interface ScenarioCompanySelectionProps {
  onSelect: (scenarioId: string) => void;
}

// Data source:
// ScenarioService.findMany(context) -> ScenarioRecord[]
```

| Capability | Backing | Static or dynamic |
|---|---|---|
| List available companies | `ScenarioService.findMany(context)` → `ScenarioRecord[]` | Dynamic |
| Company profile card (industry, maturity, narrative) | Static content from the matching `docs/scenarios/<NAME>.md` file's "Profile"/"Narrative" sections, keyed by `ScenarioRecord.name` | Static — `ScenarioRecord` itself has no `industry`/`maturity`/`narrative` fields, so this content is sourced from the doc, not the record |
| Search/filter companies | `ScenarioService.search(context, term, ["name","description"])` | Dynamic |

Five named scenarios exist today (CloudPay, GovSec, HealthBridge, ManufacturX,
RetailNova) — this section must render all `ScenarioRecord` rows returned, not a
hardcoded list of five, so a sixth scenario added later requires no component change.

---

## 2. Org Charts

```ts
interface ScenarioOrgChartSectionProps {
  scenarioId: string;
  orgConfig: OrgChartConfig;   // same shape as LEARNING_RUNTIME_VISUAL_COMPONENTS.md's OrgChartConfig
}
```

Reuses `<OrgChart />` from `LEARNING_RUNTIME_VISUAL_COMPONENTS.md` verbatim — this section
is a thin wrapper that resolves `orgConfig` from the scenario doc's "Organization Chart"
section (e.g. CloudPay's "CEO → CTO/CISO (dual-hatted) → Engineering Lead → 2 security
engineers; no separate GRC reporting line") and passes it through. No additional service
call beyond what `<OrgChart />` already specifies (static-config-only by default, with
the inert `UserService` seam).

| Capability | Backing | Static or dynamic |
|---|---|---|
| Render scenario org chart | Static `orgConfig`, authored per scenario doc | Static |
| Highlight a documented gap (e.g. CloudPay's missing GRC reporting line) | Static annotation field on the relevant role node (e.g. `roles[].gapNote: string`) | Static |

---

## 3. Assets

```ts
interface ScenarioAssetsSectionProps {
  scenarioId: string;
  projectId: string;
}

// Data source:
// AssetService.findMany(context) -> AssetRecord[], filtered client-side to this scenario's
// simulated_company_objects (object_type = "asset")
```

| Capability | Backing | Static or dynamic |
|---|---|---|
| List scenario assets | `AssetService.findMany(context)` → `AssetRecord[]`, filtered to the scenario's seeded asset rows | Dynamic, once `simulated_company_objects` are seeded (per each scenario doc's "Simulated objects" table, marked "indicative — not yet seeded") |
| Asset detail (name, status) | Same `AssetRecord` fields | Dynamic |
| Architecture diagram overlay (e.g. CloudPay's Production Payments API → Customer PII Database) | Reuses `<DiagramViewer />` with static `DiagramConfig` from the scenario's "Technology Architecture Diagram" section | Static |

**Seeding gap**: every scenario doc's asset table is currently marked "indicative — not
yet seeded" against `simulated_company_objects`. This section's dynamic path has no rows
to return until that seeding work happens — documented here as a precondition, not
resolved.

---

## 4. Risks

```ts
interface ScenarioRisksSectionProps {
  scenarioId: string;
}

// Data source:
// RiskService.findAssessments(context, riskId) -> RiskAssessmentRecord[], one call per
// seeded risk id for this scenario
```

| Capability | Backing | Static or dynamic |
|---|---|---|
| Risk Landscape Map | Reuses `<RiskHeatmap />` from `LEARNING_RUNTIME_VISUAL_COMPONENTS.md`, with `dataSource.riskId` set per the scenario's seeded risk(s) (e.g. CloudPay's "Unencrypted Backup Snapshots") | Dynamic, same seeding-gap caveat as Assets |
| Risk list/register view | `RiskService.findAssessments` results aggregated across all of the scenario's seeded risk ids | Dynamic |

---

## 5. Controls

```ts
interface ScenarioControlsSectionProps {
  scenarioId: string;
}

// Data source:
// ControlService.findMappings(context, sourceControlId) -> ControlMappingRecord[], one
// call per seeded control id for this scenario
```

| Capability | Backing | Static or dynamic |
|---|---|---|
| Control Coverage Map | Reuses `<FrameworkCrosswalk />` from `LEARNING_RUNTIME_VISUAL_COMPONENTS.md`, fed the scenario's seeded control ids (e.g. CloudPay's "Encryption at Rest", "Access Review Quarterly") | Dynamic, same seeding-gap caveat |
| Compliance Coverage Map (pivoted by framework instead of control) | Same `ControlMappingRecord[]` data, pivoted client-side by `frameworkId` instead of `sourceControlId` | Dynamic, client-side pivot, no extra service call |

---

## 6. Vendors

```ts
interface ScenarioVendorsSectionProps {
  scenarioId: string;
}

// Data source (documented gap stand-in):
// AssetService.findMany(context) -> AssetRecord[], filtered to vendor-modeled assets,
// joined with RiskService.findAssessments for data-access-weighted scoring
```

**No dedicated `VendorService` exists.** Per `docs/artifacts/VENDOR_ASSESSMENT.md`'s
documented gap and `docs/learning/LEARNING_RUNTIME_PREPARATION.md` item 4
("Vendor-as-asset modeling... `<VendorMap />` depends on `AssetService` standing in for a
dedicated vendor entity... confirm this modeling choice survives into the runtime before
building against it"), this section carries that same gap forward rather than inventing
a `VendorService`:

| Capability | Backing | Static or dynamic | Gap status |
|---|---|---|---|
| Vendor list | `AssetService.findMany(context)`, filtered to records representing vendors (no `objectType: "vendor"` discriminator confirmed to exist on `AssetRecord` — this filter's exact mechanism is unresolved and named here as an open question, not invented) | Dynamic, blocked on the filter mechanism decision | **Open** |
| Vendor risk score (data-access-weighted) | `RiskService.findAssessments(context, riskId)`, combined with the documented data-access multiplier from `VENDOR_ASSESSMENT.md`'s "Structure" section | Dynamic, same seeding-gap caveat as Assets/Risks above | Inherited gap |
| Vendor Ecosystem Map (e.g. CloudPay's minimal 2-3 node map) | Static node list per scenario doc's "Vendor Ecosystem Map" section, with dynamic risk-score overlay per node where available | Static skeleton + dynamic overlay |

This section must not silently render an empty state when the vendor-modeling question
is unresolved — per CLAUDE.md's "zero empty states" rule, it should render the static
ecosystem map (always available, since it's authored per scenario doc) even when the
dynamic risk-score overlay has no data yet.

---

## 7. Incidents

```ts
interface ScenarioIncidentsSectionProps {
  scenarioId: string;
}

// No dataSource. UI shell only.
```

**No `IncidentService` exists**, and no incident data is exposed through any of the 12
confirmed services. This matches the gap already documented in
`INTERACTIVE_RENDERING_SPEC.md`'s `<IncidentFlow />` row ("live data source flagged as a
gap... same as noted in each scenario's 'Incident Flow' section") and in each scenario
doc itself — e.g. CloudPay: "no recorded incident history in its seeded objects... no
Incident Flow exists for this scenario yet. This is a documented gap, not an invented
incident."

| Capability | Backing | Status |
|---|---|---|
| Render Incident section UI shell (tab/panel exists in `<ScenarioViewer />`'s navigation) | None — static UI shell, no fetch attempted | Implemented as shell only |
| Display lifecycle stages (Detect → Contain → Eradicate → Recover → Lessons Learned) | Reuses `<WorkflowViewer />`'s static `WorkflowConfig`, sourced from `DIAGRAM_LIBRARY.md`'s "Incident Lifecycle" entry, for scenarios that have a narrative incident (HealthBridge, ManufacturX per `LEARNING_RUNTIME_PREPARATION.md`'s note that these are "better anchors for incident-flow exercises") | Static — the lifecycle stages themselves are static config, independent of any service |
| Per-incident data (timeline, affected assets, response actions taken) | **Blocked.** No service exists to fetch this. | **Gap — UI shell with no live data source until `IncidentService` (or an approved alternative) is built, per `LEARNING_RUNTIME_PREPARATION.md` item 3.** |

For scenarios with no documented incident narrative at all (CloudPay), this section
should render an explicit "No incident history for this scenario" static message rather
than an empty panel — satisfying "zero empty states" without fabricating incident data.

---

## Section navigation summary

| Section | Backing service(s) | Status |
|---|---|---|
| Company Selection | `ScenarioService.findMany`, `.search` | Dynamic, ready |
| Org Charts | None (static config, reuses `<OrgChart />`) | Static, ready |
| Assets | `AssetService.findMany` | Dynamic, blocked on `simulated_company_objects` seeding |
| Risks | `RiskService.findAssessments` | Dynamic, blocked on seeding |
| Controls | `ControlService.findMappings` | Dynamic, blocked on seeding |
| Vendors | `AssetService.findMany` (stand-in) + `RiskService.findAssessments` | Dynamic, blocked on seeding **and** the open vendor-filter-mechanism question |
| Incidents | None confirmed to exist | **Blocked — UI shell only, gap carried forward unresolved** |

## What this wave does NOT do
- Does not implement `<ScenarioViewer />` or any of its seven section sub-components in
  code.
- Does not create `VendorService`, `IncidentService`, or any other new service — both
  gaps are carried forward exactly as already documented in
  `docs/artifacts/VENDOR_ASSESSMENT.md`, `docs/learning/LEARNING_RUNTIME_PREPARATION.md`,
  and `docs/learning/INTERACTIVE_RENDERING_SPEC.md`, not re-invented or silently resolved.
- Does not seed `simulated_company_objects` — every dynamic section above (Assets,
  Risks, Controls, Vendors) is blocked on that seeding work happening first, per each
  scenario doc's "indicative — not yet seeded" note.
- Does not decide the vendor-asset filter mechanism (how an `AssetRecord` is identified
  as a vendor vs. a regular asset) — flagged as an open question for the next
  documentation pass, not answered here.
- Does not add a data layer, table, or route for incident history.
