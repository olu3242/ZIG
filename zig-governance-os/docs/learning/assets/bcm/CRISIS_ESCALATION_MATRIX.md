# Crisis Escalation Matrix (Detail Spec)

## Purpose
Detail spec for the tabular companion to the existing Crisis Escalation Chart and Crisis
Escalation Decision Tree. This is a content spec only — no rendering implementation.

## Structure

| Severity | Notify | Decision Authority | SLA |
|---|---|---|---|
| Low | Team lead | Team lead | 4 hours |
| Medium | Department head, Security Lead | Department head | 1 hour |
| High | Executive team, Crisis Management Team | CMT chair | 30 minutes |
| Critical | Board, CEO, all CMT | CEO / Board | Immediate |

(Same columns as the indexed Crisis Escalation Chart — reused, not redefined.)

## Used by
- `bcm_dr/04_*`
- Cross-references `TABLE_LIBRARY.md` → "Crisis Escalation Chart"
- Cross-references `DECISION_TREE_LIBRARY.md` → "Crisis Escalation Decision Tree"

## Reconciliation
This Matrix is the same artifact as `TABLE_LIBRARY.md`'s "Crisis Escalation Chart" — same
columns (Severity, Notify, Decision Authority, SLA), reused here rather than redefined. It
is the **tabular lookup form** of the logic that `DECISION_TREE_LIBRARY.md`'s "Crisis
Escalation Decision Tree" expresses as a branching diagram (disruption severity → notify
vs. activate continuity plan vs. declare disaster). The Matrix answers "given this severity,
who gets notified and who decides, by when"; the Tree answers "how do we determine the
severity branch in the first place." They are companion views of one escalation model, not
three separate or conflicting assets.
