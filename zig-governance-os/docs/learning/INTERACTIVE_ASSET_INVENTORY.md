# Interactive Asset Inventory

## Purpose
The complete, indexed inventory of every visual and interactive asset in the Learning OS
as of Batches 41-60. This is the single reference a future rendering implementation
(Batch 51-60: Learning Runtime, Diagram Renderer, etc.) should consult to know exactly
what exists, where it's specified, and what it depends on.

## Index libraries (7)
`DIAGRAM_LIBRARY.md`, `WORKFLOW_LIBRARY.md`, `TABLE_LIBRARY.md`, `FRAMEWORK_MAP_LIBRARY.md`,
`ORG_CHART_LIBRARY.md`, `HEATMAP_LIBRARY.md`, `DECISION_TREE_LIBRARY.md` — each a table of
named assets, the lesson(s) that use them, and what they depict.

## Detail asset files (39), by track
| Track | Files | Directory |
|---|---|---|
| Governance | 4 | `docs/learning/assets/governance/` |
| Risk | 5 | `docs/learning/assets/risk/` |
| Compliance | 5 | `docs/learning/assets/compliance/` |
| Audit | 5 | `docs/learning/assets/audit/` |
| Vendor Risk | 5 | `docs/learning/assets/vendor/` |
| Security Governance | 5 | `docs/learning/assets/security/` |
| BCM/DR | 5 | `docs/learning/assets/bcm/` |
| Executive Leadership | 5 | `docs/learning/assets/executive/` |

## Interactive objects (8)
Specified in `docs/learning/interactive/INTERACTIVE_LEARNING_OBJECTS.md`: Interactive Risk
Heatmap, Interactive Framework Map, Interactive Control Matrix, Interactive Audit
Timeline, Interactive Org Chart, Interactive Vendor Ecosystem, Interactive Incident Flow,
Interactive Compliance Dashboard.

## Rendering components (13)
Specified in `docs/learning/INTERACTIVE_RENDERING_SPEC.md`: `<DiagramViewer />`,
`<WorkflowViewer />`, `<RiskHeatmap />`, `<FrameworkCrosswalk />`, `<ControlMatrix />`,
`<AuditTimeline />`, `<DecisionTree />`, `<OrgChart />`, `<ArchitectureViewer />`,
`<ScenarioViewer />`, `<VendorMap />`, `<ComplianceDashboard />`, `<IncidentFlow />`.

## Assets flagged as new (not yet in any index library — 9 total)
`Readiness Dashboard` (Compliance), `CAPA Workflow` (Audit), `Continuous Monitoring
Workflow` (Vendor), `Security Program Architecture` (Security Governance), `Resilience
Architecture` (BCM/DR), `Strategic Risk Dashboard`, `Maturity Models`, `Governance
Reporting Matrix`, `KPI Hierarchies` (all Executive Leadership). Each names, in its own
detail file, which index library it should eventually be added to — none of the 7 index
libraries were edited to add them in this wave, to avoid the parallel asset-detail agents
clobbering each other's edits to shared files.

## No duplicates
Every detail file includes a "Reconciliation" note stating whether it's a direct reuse, an
elaboration, or a genuinely new asset relative to the 7 index libraries — enforced per the
"no duplicate visual models" success criterion. Two intentional same-asset-different-track
reuses are documented: Control Coverage Matrix (Compliance and Security Governance both
reference the same asset), Crisis Escalation Matrix (the tabular companion to both an
existing Table Library chart and Decision Tree Library tree).

## What this wave does NOT do
Does not render anything. Does not add the 9 flagged new assets to their target index
libraries — that's the recommended next documentation step, listed here so it isn't lost.
