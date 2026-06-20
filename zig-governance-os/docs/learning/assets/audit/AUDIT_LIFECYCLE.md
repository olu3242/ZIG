# Audit Lifecycle (detail)

> Content spec only — no rendering, no code, no schema change.

## Purpose
Teach the audit-track's simplified five-phase view of an audit engagement, used as the
track's onboarding diagram before the more granular six-step version is introduced.

## Visual structure
```
Planning → Fieldwork → Testing → Reporting → Follow-Up
```

| Phase | What happens |
|---|---|
| Planning | Define scope, objectives, timeline, and resources for the engagement |
| Fieldwork | On-the-ground evidence gathering, interviews, walkthroughs |
| Testing | Controls are tested against the planned criteria; results recorded |
| Reporting | Findings, conclusions, and recommendations are documented and delivered |
| Follow-Up | Confirm remediation of findings; close or re-test as needed |

## Used by
Proposed for the audit track's introductory lesson (e.g. `audit/01_AUDIT_FOUNDATIONS.md`
intro section), as a simplified five-phase mental model before the detailed lifecycle.

## Reconciliation
`DIAGRAM_LIBRARY.md` already has an **"Audit Lifecycle"** entry under `## Audit`:
`Plan → Scope → Fieldwork → Finding → Report → Remediate` (six steps), used by
`audit/01_AUDIT_FOUNDATIONS.md`. This file's five-step version (`Planning → Fieldwork →
Testing → Reporting → Follow-Up`) is **not identical** — it differs in both step count and
naming. These are reconciled as follows:

- The existing six-step version is the **canonical, library-indexed** Audit Lifecycle
  diagram and should remain the one actually taught/rendered.
- This file's five-step version maps onto it as: Planning ≈ Plan + Scope; Fieldwork =
  Fieldwork; Testing + Reporting ≈ Finding + Report; Follow-Up = Remediate.
- This detail file should **not** be used to introduce a second, competing "Audit
  Lifecycle" diagram. It is included here for completeness per the task brief, but the
  recommended follow-up is to either retire this five-step version or explicitly relabel it
  (e.g. "Audit Lifecycle — IIA-style summary view") so it is not confused with the canonical
  six-step entry already in `DIAGRAM_LIBRARY.md`.
