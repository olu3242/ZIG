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
