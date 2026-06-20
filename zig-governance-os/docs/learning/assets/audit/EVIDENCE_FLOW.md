# Evidence Flow

> Content spec only — no rendering, no code, no schema change.

## Purpose
Show the end-to-end path a single piece of evidence travels, from the control it backs all
the way through to remediation if a finding results — a wider-angle view than the existing
evidence collection diagram.

## Visual structure
```
Control → Evidence → Testing → Finding → Remediation
```

| Step | What happens |
|---|---|
| Control | The control as designed/operated, which evidence will be collected to support |
| Evidence | Artifact requested, collected, and validated against the control |
| Testing | Evidence is tested against the audit criteria |
| Finding | If testing fails, a finding is raised and routed |
| Remediation | Corrective action is taken and verified, closing the loop back to the control |

## Used by
Proposed for the audit track's evidence-handling lesson (e.g. `audit/03_*`), as the
"big picture" diagram that frames where the existing Evidence Collection Workflow Diagram
fits.

## Reconciliation
`DIAGRAM_LIBRARY.md` already has an **"Evidence Collection Workflow Diagram"** entry under
`## Audit`: `Request → Collect → Validate → Link to Control`, used by `audit/03_*`. This
file's "Evidence Flow" is **broader in scope, not a duplicate**:

- The existing diagram covers only the **collection** sub-process: how a piece of evidence
  gets requested, gathered, validated, and attached to a control.
- This file's "Evidence Flow" wraps that entire sub-process inside the single "Evidence"
  step of a longer chain, then continues forward into Testing, Finding, and Remediation —
  stages the existing diagram does not cover.

In other words: `Control → [Request → Collect → Validate → Link to Control] → Testing →
Finding → Remediation`, where the bracketed portion is the existing library diagram nested
inside this one's second step.
