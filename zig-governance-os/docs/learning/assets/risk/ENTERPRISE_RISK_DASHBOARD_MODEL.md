# Enterprise Risk Dashboard Model

## Purpose
Teaches what an executive-facing enterprise risk dashboard rolls up from the underlying
risk register and heatmap — the single-pane view a Risk Analyst or executive uses to
understand overall risk posture without digging into individual risk records.

## Structure (content spec, not a rendering implementation)

```
+-----------------------------------------------------------+
| ENTERPRISE RISK DASHBOARD                                  |
+-----------------------------------------------------------+
| Top Risks (by score)        | Risk Trend (score over time)|
| 1. Vendor data breach  (15) |   25 |        *              |
| 2. Ransomware exposure (12) |   20 |     *     *           |
| 3. Key-person dependency(9) |   15 |  *           *         |
|                              |   10 |________________      |
|                              |       Q1  Q2  Q3  Q4        |
+-----------------------------------------------------------+
| Treatment Status by Owner                                  |
| Owner          | Open | Mitigating | Closed | Overdue      |
| CISO           |  4   |     6      |   12   |   1          |
| CFO            |  2   |     1      |    5   |   0          |
| Ops Director   |  3   |     2      |    8   |   2          |
+-----------------------------------------------------------+
| Heatmap snapshot (5x5, current quarter)                    |
| [embedded Risk Heatmap — see HEATMAP_LIBRARY.md]            |
+-----------------------------------------------------------+
```

| Dashboard section | Rolls up from |
|---|---|
| Top Risks | Risk register, sorted by current score |
| Risk Trend | Historical score snapshots over time per risk/aggregate |
| Treatment Status by Owner | Risk register filtered/grouped by owner and treatment state |
| Heatmap snapshot | Current Risk Heatmap / Risk Scoring Matrix plot |

## Used by
- `risk/05_*` and `executive_leadership/03_*` (governance dashboard companion for risk-specific rollups)
- `DIAGRAM_LIBRARY.md` — "Governance Dashboard" entry (executive_leadership track) as the
  broader pattern this risk-specific dashboard follows

## Reconciliation
This is a new named asset — no existing library entry already named an
"Enterprise Risk Dashboard." It is closely related to `DIAGRAM_LIBRARY.md`'s
"Governance Dashboard" entry (`executive_leadership/03_*`, "Score trend + top risks +
control coverage, single-pane"), which is the broader cross-domain executive dashboard.
This file specializes that same single-pane pattern for the Risk Workspace specifically,
rolling up the Risk Heatmap (`HEATMAP_LIBRARY.md`) and risk register treatment status
rather than the full governance score. Treat this as a risk-domain sibling of the
Governance Dashboard, not a duplicate.
