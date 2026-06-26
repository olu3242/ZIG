# Finding Escalation Matrix

> Content spec only — no rendering, no code, no schema change.

## Purpose
Provide the tabular companion to two existing flow-shaped assets: a quick-reference grid of
severity × who gets notified, for use alongside (not instead of) the workflow and decision
tree that already cover this territory.

## Visual structure
| Severity | Notified | Response SLA | Escalation Path |
|---|---|---|---|
| Critical | Control owner, CISO/compliance lead, executive sponsor | 24 hours | Immediate escalation to executive leadership |
| High | Control owner, compliance lead | 3 business days | Escalates to compliance lead if unresolved at SLA |
| Medium | Control owner | 2 weeks | Escalates to compliance lead if missed |
| Low | Control owner | Next review cycle | Tracked, no automatic escalation |

This matrix answers "who needs to know, and how fast," for a finding whose severity has
already been determined.

## Used by
Proposed for the audit track's escalation lesson (e.g. `audit/04_*`), as the reference
table learners consult immediately after the decision tree assigns severity and before/
alongside the escalation workflow runs.

## Reconciliation
This matrix is the **tabular companion** to two existing assets, not a replacement for
either:

- `WORKFLOW_LIBRARY.md`'s **"Finding Escalation Workflow"** (`## Audit`, used by
  `audit/04_*`): `Finding identified → severity assigned → routed to control owner →
  corrective action plan → re-test → closure`. That workflow describes the **sequence of
  steps over time**. This matrix describes a **static lookup**: given a severity, who is
  notified and how fast — it fills in the "routed to control owner" step of that workflow
  with the specific people/SLA per severity level.
- `DECISION_TREE_LIBRARY.md`'s **"Finding Severity Decision Tree"** (`## Audit`, used by
  `audit/04_*`): `Evidence strength + control criticality → finding severity → escalation
  path`. That tree produces the **severity classification** as its output. This matrix
  picks up exactly where the tree leaves off, taking the tree's output (severity) as its
  input (row lookup).

In short: Decision Tree determines severity → this Matrix determines who/how-fast →
Workflow determines the full step sequence the finding moves through. None of the three
duplicates another; each covers a different shape of the same problem (branching logic,
static lookup, sequential process).
