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
