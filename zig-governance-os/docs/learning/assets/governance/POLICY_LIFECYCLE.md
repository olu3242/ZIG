# Policy Lifecycle

## Purpose
Teaches the recurring lifecycle every governance policy moves through, from initial
drafting to eventual retirement, emphasizing that policy management is a cycle, not a
one-time document creation event.

## Structure (content spec, not a rendering implementation)

```
Draft -> Review -> Approve -> Publish -> Monitor -> Retire
  ^                                         |
  |_________________________________________|
        (revision cycle re-enters at Draft/Review)
```

| Stage | What happens |
|---|---|
| Draft | Policy owner authors or updates the policy text |
| Review | Stakeholders (legal, security, governance committee) review for accuracy and conflicts |
| Approve | Governance committee or designated authority formally approves |
| Publish | Policy is distributed/communicated to the organization |
| Monitor | Policy effectiveness and compliance are tracked on an ongoing basis; periodic re-review triggered here |
| Retire | Policy is formally retired or superseded when no longer applicable |

## Used by
- `governance/03_POLICY_LIFECYCLE.md`
- `DIAGRAM_LIBRARY.md` — "Policy Lifecycle" entry

## Reconciliation
`DIAGRAM_LIBRARY.md` names this exact asset "Policy Lifecycle" and depicts it as "Draft →
Review → Approve → Publish → Review-cycle → Retire." This file reuses that same name (no
new asset created) and clarifies that the library's "Review-cycle" step and this file's
"Monitor" step refer to the same stage of the lifecycle — the ongoing periodic-review
loop that runs after publication and before retirement. "Monitor" is used here as the
more descriptive label for that stage; both terms describe identical content.
