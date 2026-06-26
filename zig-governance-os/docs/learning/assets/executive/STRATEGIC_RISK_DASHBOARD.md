# Strategic Risk Dashboard (Detail Spec)

## Purpose
New asset describing a board-facing risk dashboard that distills the operational risk
register into business-language summary. This is a content spec only — no rendering
implementation.

## Structure

| Rank | Risk (business language) | Trend | Treatment Status |
|---|---|---|---|
| 1 | Unscoped PCI DSS boundary could expose cardholder data | ↑ Worsening | In progress |
| 2 | Single payment processor outage halts e-commerce revenue | → Stable | Mitigated |
| 3 | Key-person dependency in security leadership | ↑ Worsening | Not started |
| 4 | Third-party vendor breach exposure (Tier 1 vendors) | → Stable | In progress |
| 5 | Regulatory change readiness gap | ↓ Improving | Mitigated |

Only the top 5 risks are shown, translated from technical/risk-register language into
business impact statements, with a trend arrow and treatment status — no raw scores or
technical jargon.

## Used by
- `executive_leadership/02_*`, `executive_leadership/05_*` (proposed — see follow-up note)

## Reconciliation
This is a **new asset**. It is related to but distinct from `DIAGRAM_LIBRARY.md`'s
"Governance Dashboard" (score trend + top risks + control coverage, single-pane) — that
entry is the broader single-pane executive view; this dashboard is the risk-specific
drill-down used in board reporting materials. Should be added to a library doc (likely
`TABLE_LIBRARY.md` or a future dashboard-specific library) as a follow-up; this file does
not edit any existing library doc.
