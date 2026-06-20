# Scenario: RetailNova

Simulated company used as the applied-practice anchor for Vendor Risk, Compliance
(PCI DSS), and Governance track exercises. Backed by `simulated_companies` /
`simulated_company_objects` — no new schema required.

## Profile

| Field | Value |
|---|---|
| `name` | RetailNova |
| `industry` | Retail / E-commerce |
| `maturity` | 45 (mid-stage; PCI DSS partially scoped, vendor risk program informal) |

## Narrative

RetailNova runs a multi-brand e-commerce platform with three external payment processors
and a dozen logistics/marketing vendors with varying data access. Its PCI DSS scope was
never formally documented, and vendor risk assessments happen ad hoc over email — the
anchor for the Vendor Risk track's "Assess RetailNova's Top 3 Payment Processors" module
and the Compliance track's multi-framework mapping exercise.

## Simulated objects (`simulated_company_objects`, indicative — not yet seeded)

| `object_type` | `name` | `status` |
|---|---|---|
| asset | Payment Processor: Processor A (vendor) | active |
| asset | Payment Processor: Processor B (vendor) | active |
| asset | Cardholder Data Environment | active |
| risk | Unscoped PCI DSS Boundary | open |
| control | Vendor Security Questionnaire | planned |

Seeding these rows is a follow-up to this doc, not included here (doc-first per
`CLAUDE.md`).

## Organization Chart
See `docs/learning/ORG_CHART_LIBRARY.md` → "RetailNova Organization Chart". Depicts: CEO →
VP Engineering / VP Security (separate lines) → Security Lead, with no dedicated vendor-risk
owner — the structural gap the Vendor Risk lab's "rank both vendors and recommend a
monitoring cadence" task is designed to expose.

## Technology Architecture Diagram
See `docs/learning/DIAGRAM_LIBRARY.md` → "RetailNova Technology Architecture". Depicts:
POS + e-commerce front end → Cardholder Data Environment, with Processor A and Processor B
shown as external integrations crossing the PCI DSS boundary that is currently unscoped.

## Vendor Ecosystem Map
See `docs/learning/WORKFLOW_LIBRARY.md` → "Vendor Ecosystem Assessment Workflow" and
`docs/learning/HEATMAP_LIBRARY.md` → "Vendor Risk Heatmap". Depicts: Processor A and
Processor B as Tier 1 (high data access, cardholder data), plus the dozen
logistics/marketing vendors as Tier 2/3 by data-access level — the multi-vendor map the
Vendor Risk Lab's due-diligence task scopes down to the two payment processors.

## Risk Landscape Map
See `docs/learning/HEATMAP_LIBRARY.md` → "RetailNova Risk Landscape Map". Plots
"Unscoped PCI DSS Boundary" (open) at high impact given cardholder-data exposure.

## Compliance Coverage Map
See `docs/learning/TABLE_LIBRARY.md` → "RetailNova Compliance Coverage Map". Row: PCI DSS
— shown as "no control" for formal scope documentation (matches the open
"Unscoped PCI DSS Boundary" risk), "planned" for the Vendor Security Questionnaire
control.
