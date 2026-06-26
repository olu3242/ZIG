# Risk Heatmaps (3x3 / 4x4 / 5x5 Variants)

## Purpose
Teaches that the risk heatmap grid size is a maturity-appropriate choice, not a fixed
constant — programs at different maturity levels use coarser or finer-grained grids for
plotting likelihood × impact.

## Structure (content spec, not a rendering implementation)

### 3x3 variant
```
Impact:    Low | Med | High
Likelihood:
  High      M  |  H  |  H
  Med       L  |  M  |  H
  Low       L  |  L  |  M
```
Three bands each axis (Low/Med/High). Coarsest grid — fastest to populate, lowest
precision.

### 4x4 variant
```
4 bands each axis (e.g., Low/Med/High/Critical), 16 cells total.
```
Middle ground — adds a "Critical" distinction without requiring the analytical rigor of
a full 5-point scale.

### 5x5 variant (canonical, per `HEATMAP_LIBRARY.md`)
```
5 bands each axis (1-5 likelihood x 1-5 impact), 25 cells, scores 1-25.
```
Finest-grained, most precise, used by mature programs with enough historical data to
support five-point distinctions.

## When to use which
| Grid | Best for |
|---|---|
| 3x3 | Early-stage/less mature programs, small risk registers, qualitative-only assessment |
| 4x4 | Growing programs that want more granularity than 3x3 but aren't ready for full 5x5 quantitative scoring |
| 5x5 | Mature programs with quantitative scoring methodology, larger risk registers, board-level reporting needing precision |

## Used by
- `risk/03_*` (risk scoring lessons, as a maturity-progression teaching aid)
- `HEATMAP_LIBRARY.md` — "Risk Heatmap" and "Risk Scoring Matrix" entries (5x5)

## Reconciliation
`HEATMAP_LIBRARY.md`'s "Risk Heatmap" and "Risk Scoring Matrix" entries both assume a 5x5
grid as the default/canonical heatmap for the platform. This file does not contradict or
replace that — 5x5 remains canonical for Zig's actual risk scoring. This file adds the
3x3 and 4x4 variants purely as a teaching device, explaining to learners *why* some
organizations they encounter (e.g., in scenario orgs with lower governance maturity) use
simpler grids, and when a program might graduate from 3x3/4x4 to the platform's 5x5
standard.
