# Risk Treatment Decision Tree

## Purpose
Teaches the branching logic a risk owner follows to choose a treatment option — Accept,
Mitigate, Transfer, or Avoid — based on risk score and cost/feasibility of mitigation.

## Structure (content spec, not a rendering implementation)

```
Risk Scored
   |
   v
Is the score within acceptable risk appetite?
   |--Yes--> Accept (document rationale, monitor)
   |
   `--No--> Can the risk be reduced cost-effectively?
              |--Yes--> Mitigate (apply control, re-score)
              |
              `--No--> Can the risk be shifted to a third party?
                         |--Yes--> Transfer (insurance, contract, outsourcing)
                         |
                         `--No--> Avoid (eliminate the activity/exposure causing the risk)
```

| Branch | Outcome |
|---|---|
| Accept | Risk is within appetite; documented and monitored, no further action |
| Mitigate | Control(s) applied to reduce likelihood/impact, risk re-scored after |
| Transfer | Risk shifted via insurance, contract terms, or outsourcing |
| Avoid | Underlying activity or exposure eliminated entirely |

## Used by
- `risk/04_*`
- `WORKFLOW_LIBRARY.md` — "Risk Treatment Workflow" entry
- `DECISION_TREE_LIBRARY.md` — "Risk Treatment Decision Tree" entry

## Reconciliation
Both `WORKFLOW_LIBRARY.md` ("Risk Treatment Workflow": risk scored → treatment option
selected → owner assigned → tracked to closure) and `DECISION_TREE_LIBRARY.md`
("Risk Treatment Decision Tree": risk score band + cost of mitigation → accept /
mitigate / transfer / avoid) **already name this exact asset**. This file is not a new
or duplicate asset — it is the detailed content spec for the existing
`DECISION_TREE_LIBRARY.md` "Risk Treatment Decision Tree" entry, expanding its branching
logic into the explicit decision sequence shown above. The Workflow Library's "Risk
Treatment Workflow" entry remains the linear, post-decision tracking view (owner
assignment → closure); this decision tree is the branching logic that feeds into that
workflow's "treatment option selected" step. No duplicate asset is created.
