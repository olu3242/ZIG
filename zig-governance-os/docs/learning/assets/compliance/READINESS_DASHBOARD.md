# Framework Readiness Dashboard

> Content spec only — no rendering, no code, no schema change.

## Purpose
Give a learner (and, eventually, a real user) a single-glance view of how ready an
organization is for a given framework's audit or certification: where coverage stands,
where the gaps are, and what's left to do. This is a **new asset**, not yet present in any
of the 8 library docs.

## Visual structure
A dashboard composed of three panels:

**1. Overall coverage %**
```
ISO 27001 Readiness: ███████████████░░░░░  74%
SOC 2 Readiness:     █████████████████░░░  86%
NIST CSF Readiness:  ██████████░░░░░░░░░░  52%
```

**2. Gaps by control family**
| Control Family | Required Controls | Implemented | Gap |
|---|---|---|---|
| Access Control | 12 | 9 | 3 |
| Asset Management | 8 | 8 | 0 |
| Incident Response | 6 | 3 | 3 |
| Vendor Management | 5 | 2 | 3 |

**3. Audit-readiness score**
A single composite number (0–100), broken into its inputs (e.g. coverage %, evidence
completeness %, overdue remediation count), with the same "explainable score" structure
used by the Governance Scoring Engine — readiness score must say why it is what it is.

## Used by
Not yet referenced by any lesson — proposed for the Compliance track's readiness/audit-prep
lessons (e.g. `compliance/03_*` or `compliance/04_*`, wherever readiness assessment is
taught).

## Reconciliation
This is a **new asset**. It should be added as a new row to either `FRAMEWORK_MAP_LIBRARY.md`
(if classified as a cross-framework map) or `TABLE_LIBRARY.md` (if classified as a
structured table) as a follow-up. This file does not edit either library doc — that edit is
left for a subsequent pass so the library indexes stay the single source of truth.
