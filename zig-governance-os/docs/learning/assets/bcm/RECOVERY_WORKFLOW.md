# Recovery Workflow (Detail Spec)

## Purpose
Detail spec reusing the existing "Recovery Workflow" from `WORKFLOW_LIBRARY.md`. This is a
content spec only — no rendering implementation.

## Structure

```
Disruption Declared → Failover Initiated → Recovery Validated (against RTO/RPO) → Stand-down
```

| Step | What happens |
|---|---|
| Disruption Declared | Incident meets disruption threshold, recovery plan activated |
| Failover Initiated | Failover to backup systems/site begins |
| Recovery Validated | Recovery confirmed against RTO/RPO targets from the BIA |
| Stand-down | Normal operations resumed, recovery team stands down |

## Used by
- `bcm_dr/04_*`
- Cross-references `WORKFLOW_LIBRARY.md` → "Recovery Workflow"

## Reconciliation
Direct reuse of `WORKFLOW_LIBRARY.md`'s existing "Recovery Workflow" entry ("Disruption
declared → failover initiated → recovery validated against RTO/RPO → stand-down") — no
change to the steps, just the detailed text rendering spec the indexed entry did not yet
have.
