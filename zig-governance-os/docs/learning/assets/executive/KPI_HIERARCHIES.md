# KPI Hierarchies (Detail Spec)

## Purpose
New asset showing how operational KPIs roll up into the board-level governance score, so
executives can trace a high-level number back to the operational metrics driving it. This
is a content spec only — no rendering implementation.

## Structure

```
Board-level KPI: Governance Score
        ▲
        │ rolls up from
        │
┌───────┴────────┬─────────────────┬──────────────────┐
│ Evidence        │ Control          │ Risk Treatment    │
│ Coverage %      │ Test Pass Rate   │ Completion %       │
└────────────────┘                  └──────────────────┘
        ▲                  ▲                   ▲
   operational KPIs tracked weekly by the GRC team
```

| Level | KPI | Owner | Cadence |
|---|---|---|---|
| Operational | Evidence coverage % | GRC team | Weekly |
| Operational | Control test pass rate | GRC team | Weekly |
| Operational | Risk treatment completion % | Risk analyst | Weekly |
| Board | Governance Score (composite) | Executive team | Monthly/Quarterly |

## Used by
- `executive_leadership/03_*` (proposed — see follow-up note below)

## Reconciliation
This is a **new asset**, not currently indexed in any library doc. It complements
`MATURITY_MODELS.md` (qualitative levels) and `GOVERNANCE_REPORTING_MATRIX.md` (audience/
cadence) by showing the quantitative roll-up logic connecting operational metrics to the
single board-facing governance score referenced throughout `docs/architecture/` scoring
docs. Should be added to `TABLE_LIBRARY.md` or `HEATMAP_LIBRARY.md` as a follow-up; this
file does not edit any existing library doc.
