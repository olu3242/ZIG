# Decision Tree Library

Branching decision logic — distinct from linear workflows (see `WORKFLOW_LIBRARY.md`)
because these show a fork at each step rather than a single path. Indexed per
`VISUAL_LEARNING_STANDARD.md`.

## Governance
| Tree | Used by | Branches on |
|---|---|---|
| Decision Escalation Tree | `governance/04_DECISION_RIGHTS.md` | Decision severity → which committee/owner has authority to approve vs. must escalate |

## Risk
| Tree | Used by | Branches on |
|---|---|---|
| Risk Treatment Decision Tree | `risk/04_*` | Risk score band + cost of mitigation → accept / mitigate / transfer / avoid |

## Audit
| Tree | Used by | Branches on |
|---|---|---|
| Finding Severity Decision Tree | `audit/04_*` | Evidence strength + control criticality → finding severity → escalation path |

## BCM/DR
| Tree | Used by | Branches on |
|---|---|---|
| Crisis Escalation Decision Tree | `bcm_dr/04_*` | Disruption severity → notify vs. activate full continuity plan vs. declare disaster |

## What this wave does NOT do
Does not implement any decision-automation logic. These trees are teaching aids showing
how a human makes the decision, not a rules engine.
