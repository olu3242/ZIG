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

## Organization Chart
See `docs/learning/ORG_CHART_LIBRARY.md` → "GovSec Organization Chart". Depicts: Agency
Director → CISO → Governance Committee, with no current line from the CISO's governance
data up to the Director/board — the gap the Executive Leadership lab's board report
closes.

## Technology Architecture Diagram
See `docs/learning/DIAGRAM_LIBRARY.md` → "GovSec Technology Architecture". Depicts:
Citizen Services Portal and its inter-agency data exchange points, annotated with NIST CSF
function coverage (Identify implemented, Respond needs evidence).

## Vendor Ecosystem Map
GovSec's vendor surface (inter-agency data-sharing partners) is out of scope for this
wave's exercises — Governance and Executive Leadership track anchors focus on internal
governance-to-board communication, not third-party risk.

## Risk Landscape Map
GovSec's scenario data does not yet include a seeded risk register (only controls and a
recommendation) — no Risk Landscape Map entry exists for this scenario; this is a
documented gap rather than an invented risk.

## Compliance Coverage Map
See `docs/learning/TABLE_LIBRARY.md` → "GovSec Compliance Coverage Map". Row: NIST CSF —
Identify Function Controls shown as "control, evidence present" (`implemented`), Respond
Function Controls shown as "control, evidence needed" (`needs_evidence`), the exact gap
the Governance track's program-build module asks the learner to close.
