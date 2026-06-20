# CAPA Workflow (Corrective Action / Preventive Action)

> Content spec only — no rendering, no code, no schema change.

## Purpose
Teach the structured root-cause-driven remediation process that follows a finding —
broader than simple "fix it" remediation, because it separately addresses the immediate
fix (corrective) and the systemic fix that prevents recurrence (preventive). This is a
**new asset**, not yet present in any of the 8 library docs.

## Visual structure
```
Finding → Root Cause → Corrective Action → Preventive Action → Verification → Closure
```

| Step | What happens |
|---|---|
| Finding | A control gap or failure has been identified and confirmed |
| Root Cause | Analysis determines *why* the control failed, not just that it failed |
| Corrective Action | The immediate fix that addresses this specific instance of the gap |
| Preventive Action | A systemic change (process, design, training) that prevents recurrence |
| Verification | Re-testing confirms both actions are effective |
| Closure | Finding is formally closed with evidence of verified remediation |

The key teaching point distinguishing this from the simpler "Finding Escalation Workflow"
already in `WORKFLOW_LIBRARY.md`: CAPA explicitly forks into two parallel actions
(corrective vs. preventive) driven by root-cause analysis, rather than a single linear
"corrective action plan" step.

## Used by
Not yet referenced by any lesson — proposed for the audit track's remediation lesson (e.g.
`audit/05_*` or wherever post-finding remediation depth is taught), as the deeper-dive
companion to the existing Finding Escalation Workflow.

## Reconciliation
This is a **new asset**. It should be added to `WORKFLOW_LIBRARY.md` under `## Audit` as a
follow-up entry alongside the existing "Finding Escalation Workflow." This file does not
edit `WORKFLOW_LIBRARY.md` — that edit is left for a subsequent pass so the library index
remains the single source of truth. Once added, the relationship to record there: CAPA
Workflow is the deeper root-cause-driven remediation path that the Finding Escalation
Workflow's "corrective action plan" step expands into.
