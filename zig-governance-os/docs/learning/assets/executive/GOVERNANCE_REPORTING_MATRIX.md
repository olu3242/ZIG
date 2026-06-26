# Governance Reporting Matrix (Detail Spec)

## Purpose
New asset defining what gets reported to which audience at what cadence, so executive
reporting content is consistent and not ad hoc per request. This is a content spec only —
no rendering implementation.

## Structure

| Audience | Cadence | Content |
|---|---|---|
| Board | Quarterly | Strategic Risk Dashboard, governance score trend, top 5 risks, maturity level by module |
| Executive Team | Monthly | Governance score detail, control coverage gaps, open high-severity risks, evidence backlog |
| GRC Team | Weekly | Task/evidence status, control test results, new findings, vendor reassessment due list |

## Used by
- `executive_leadership/05_*` (proposed — see follow-up note below)

## Reconciliation
This is a **new asset**, not currently indexed in any library doc. It is the operational
counterpart to `BOARD_REPORTING_FLOW.md` — that asset shows *how* information flows upward
through roles; this Matrix shows *what content* and *how often* at each destination.
Should be added to `TABLE_LIBRARY.md`'s Executive Leadership section as a follow-up; this
file does not edit any existing library doc.
