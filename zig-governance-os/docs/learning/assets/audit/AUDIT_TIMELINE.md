# Audit Timeline (detail)

> Content spec only — no rendering, no code, no schema change.

## Purpose
Expand the existing "Audit Timeline" table with a concrete worked example, so learners see
real phase durations and ownership, not just an empty column structure.

This is the detail file for the asset already indexed in `TABLE_LIBRARY.md` under
`## Audit` as **"Audit Timeline"** (columns: Phase, Start, End, Owner, Milestone). The name
and column structure are reused as-is.

## Visual structure
| Phase | Start | End | Owner | Milestone |
|---|---|---|---|---|
| Planning | Week 1 | Week 2 | Audit Lead | Scope and engagement letter approved |
| Fieldwork | Week 3 | Week 6 | Audit Team | Evidence requests issued and collected |
| Testing | Week 5 | Week 7 | Audit Team | Control testing complete, draft findings logged |
| Reporting | Week 7 | Week 8 | Audit Lead | Draft report issued for management response |
| Follow-Up | Week 9 | Week 12 | Control Owners | Remediation verified, findings closed |

Note the overlap between Fieldwork and Testing (Weeks 5–6) — testing typically begins on
evidence already collected while fieldwork continues on the remaining scope. This overlap
is a realistic detail worth calling out to learners who assume phases are always strictly
sequential.

## Used by
- `audit/01_AUDIT_FOUNDATIONS.md` (per `TABLE_LIBRARY.md`)

## Reconciliation
This file reuses `TABLE_LIBRARY.md`'s existing "Audit Timeline" entry verbatim (same name,
same columns) and adds a worked example. It does not introduce a new asset and does not
modify the library doc itself.
