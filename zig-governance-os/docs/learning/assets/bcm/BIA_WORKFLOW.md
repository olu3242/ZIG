# BIA Workflow (Detail Spec)

## Purpose
Detail spec presenting the Business Impact Analysis workflow as a five-step sequence,
naming "Recovery Strategy" as an explicit terminal step. This is a content spec only — no
rendering implementation.

## Structure

```
Process → Impact Analysis → RTO → RPO → Recovery Strategy
```

| Step | What happens |
|---|---|
| Process | Critical business process identified and scoped |
| Impact Analysis | Downtime cost quantified over time (financial, operational, reputational) |
| RTO | Recovery Time Objective derived from impact analysis |
| RPO | Recovery Point Objective derived (acceptable data loss window) |
| Recovery Strategy | Strategy selected to meet RTO/RPO (failover, manual workaround, etc.) |

## Used by
- `bcm_dr/02_*`
- Cross-references `WORKFLOW_LIBRARY.md` → "BIA Workflow"

## Reconciliation
`WORKFLOW_LIBRARY.md`'s existing entry is **Identify critical process → quantify downtime
cost over time → derive RTO/RPO → identify single points of failure** (four steps, RTO/RPO
combined, ending at single-points-of-failure). This version breaks RTO and RPO into separate
steps for clarity and replaces "identify single points of failure" with "Recovery Strategy"
as the terminal step — treating SPOF identification as input to the strategy choice rather
than the end goal itself. Both describe the same BIA process; this is a more
strategy-oriented breakdown for lessons that carry the analysis through to a recovery
decision, not a contradiction of the library's process-and-SPOF-focused version.
