# Scenario: GovSec

Simulated company used as the applied-practice anchor for Governance, Executive
Leadership, and Audit track exercises. Backed by `simulated_companies` /
`simulated_company_objects` — no new schema required.

## Profile

| Field | Value |
|---|---|
| `name` | GovSec |
| `industry` | Public Sector / Government Services |
| `maturity` | 55 (mid-stage; NIST CSF-aligned, governance score not yet board-reported) |

## Narrative

GovSec is a state-level agency running citizen services infrastructure under a NIST
CSF-aligned program. Its CISO has governance data (scores, recommendations, control
status) but has never turned it into a board-ready report — the anchor for the Governance
track's "Build a Governance Program for GovSec" module and the Executive Leadership
track's "Build a Board-Ready Report for GovSec" / "Present GovSec's Governance Roadmap to
a Mock Board" modules.

## Simulated objects (`simulated_company_objects`, indicative — not yet seeded)

| `object_type` | `name` | `status` |
|---|---|---|
| asset | Citizen Services Portal | active |
| control | Identify Function Controls (NIST CSF) | implemented |
| control | Respond Function Controls (NIST CSF) | needs_evidence |
| recommendation | Formalize Quarterly Board Reporting | open |

Seeding these rows is a follow-up to this doc, not included here (doc-first per
`CLAUDE.md`).
