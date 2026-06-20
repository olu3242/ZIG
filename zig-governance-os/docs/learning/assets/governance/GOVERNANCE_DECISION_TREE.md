# Governance Decision Tree

## Purpose
Teaches the simplest possible linear decision path a governance issue follows — from
identification through implementation — as an introductory teaching aid before the
learner encounters the more complex, severity-branching escalation tree used for
real decision-rights routing.

## Structure (content spec, not a rendering implementation)

```
Issue Raised
   |
   v
Review (governance committee or owner reviews the issue)
   |
   v
Approval (decision made: approve / reject / escalate)
   |
   v
Implementation (approved decision is carried out and tracked)
```

| Step | Description |
|---|---|
| Issue | A governance issue, exception, or proposal is raised |
| Review | The relevant owner or committee reviews context and options |
| Approval | A go/no-go decision is made |
| Implementation | The decision is executed and tracked to completion |

## Used by
- Introductory governance lessons that need a single-path decision walkthrough before
  introducing severity-based branching (see Reconciliation)

## Reconciliation
`DECISION_TREE_LIBRARY.md` already contains a "Decision Escalation Tree"
(`governance/04_DECISION_RIGHTS.md`) that branches on decision severity to determine
which committee/owner has approval authority versus must escalate further. This
Governance Decision Tree is **not the same asset** — it is a simpler, single-path
sequence (Issue → Review → Approval → Implementation) with no branching, intended as a
teaching scaffold for learners before they encounter the branching escalation logic. Both
assets are kept: this one names the linear baseline case, "Decision Escalation Tree"
covers the branching severity-routing case. No duplicate is created; the distinction is
intentional and documented here to prevent future confusion between the two.
