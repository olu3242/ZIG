# Scenario: ManufacturX

Simulated company used as the applied-practice anchor for Risk, BCM/DR, and Security
Governance track exercises. Backed by `simulated_companies` / `simulated_company_objects`
— no new schema required.

## Profile

| Field | Value |
|---|---|
| `name` | ManufacturX |
| `industry` | Manufacturing / Industrial OT |
| `maturity` | 30 (early-stage; OT network segmentation incomplete, no tested DR plan) |

## Narrative

ManufacturX operates two plants with legacy SCADA systems bridged onto a modern corporate
network for analytics. A single ransomware incident at a peer manufacturer prompted
leadership to ask for a real business continuity plan — but no recovery time/point
objectives have ever been defined. This is the anchor for the BCM/DR track's "Run a
Disruption Scenario for ManufacturX" / "Score ManufacturX's Recovery Readiness" modules
and the Risk track's asset-criticality-driven risk register exercise.

## Simulated objects (`simulated_company_objects`, indicative — not yet seeded)

| `object_type` | `name` | `status` |
|---|---|---|
| asset | Plant 1 SCADA Network | active |
| asset | Plant 2 SCADA Network | active |
| risk | Flat OT/IT Network Segmentation | open |
| risk | No Tested DR Failover for Plant 1 | open |
| control | Network Segmentation Project | planned |

Seeding these rows is a follow-up to this doc, not included here (doc-first per
`CLAUDE.md`).

## Organization Chart
See `docs/learning/ORG_CHART_LIBRARY.md` → "ManufacturX Organization Chart". Depicts:
Plant Operations Manager (OT) and IT Director (corporate network) reporting separately to
the COO — the split reporting line that produced the flat OT/IT segmentation risk below.

## Technology Architecture Diagram
See `docs/learning/DIAGRAM_LIBRARY.md` → "ManufacturX Technology Architecture". Depicts:
Plant 1 SCADA Network and Plant 2 SCADA Network bridged onto the corporate analytics
network with no segmentation boundary shown — the single point of failure the BCM/DR
lab's continuity plan must address.

## Vendor Ecosystem Map
ManufacturX's vendor surface is limited to SCADA equipment/maintenance vendors with
physical plant access — out of scope for this wave's exercises (BCM/DR and Risk tracks
focus on the internal OT/IT boundary, not third-party vendor risk).

## Risk Landscape Map
See `docs/learning/HEATMAP_LIBRARY.md` → "ManufacturX Risk Landscape Map". Plots "Flat
OT/IT Network Segmentation" and "No Tested DR Failover for Plant 1" (both open) at high
impact given the ransomware-incident narrative.

## Compliance Coverage Map
ManufacturX has no formal framework certification target in this scenario (its narrative
is OT/security-maturity-driven, not audit-driven) — no Compliance Coverage Map entry
exists for this scenario, consistent with its track anchors (Risk, BCM/DR, Security
Governance) rather than Compliance.

## Control Coverage Map
"Network Segmentation Project" (planned) → no framework mapping, since ManufacturX has no
compliance target per the Compliance Coverage Map above. This control exists purely to
mitigate the "Flat OT/IT Network Segmentation" risk, the cleanest example in the curriculum
of a control justified by risk treatment alone rather than framework-requirement mapping.

## Incident Flow
The Narrative references "a single ransomware incident at a peer manufacturer" as the
trigger for ManufacturX's continuity-planning request — that incident happened to a peer,
not to ManufacturX itself, so no `incident` object exists in ManufacturX's own seeded
objects above. No Incident Flow exists for this scenario; it is the cautionary external
event motivating the BCM/DR lab, not an internal incident to flow-map.

## Audit History Timeline
ManufacturX has no audit history (no compliance target, per Compliance Coverage Map
above) — no Audit History Timeline exists for this scenario, consistent with its
Risk/BCM-DR/Security-Governance anchoring rather than Audit.
