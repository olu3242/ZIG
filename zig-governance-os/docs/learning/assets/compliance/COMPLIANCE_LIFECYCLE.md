# Compliance Lifecycle

> Content spec only — no rendering, no code, no schema change.

## Purpose
Teach the program-level cycle an organization runs continuously to stay compliant with a
framework — distinct from (but related to) the per-control lifecycle already in
`DIAGRAM_LIBRARY.md`.

## Visual structure
```
Assess → Implement → Monitor → Audit → Improve
   ↑                                      |
   └──────────────────────────────────────┘
```

| Stage | What happens |
|---|---|
| Assess | Identify applicable framework requirements, current-state gaps, and risk |
| Implement | Build/deploy the controls needed to close gaps |
| Monitor | Ongoing operation and evidence collection for implemented controls |
| Audit | Internal or external verification that controls operate as designed |
| Improve | Remediate findings, update controls, feed lessons back into the next Assess pass |

## Used by
Proposed for the Compliance track's program-overview lesson (e.g.
`compliance/01_COMPLIANCE_FOUNDATIONS.md`), as the top-level diagram that the rest of the
track's lessons zoom into.

## Reconciliation
This is **related to but not identical with** `DIAGRAM_LIBRARY.md`'s existing "Control
Lifecycle" entry (`Design → Implement → Test → Evidence → Review`, used by
`compliance/02_*`). The two operate at different altitudes:

- **Compliance Lifecycle** (this file) is the **program-level** cycle — it describes what
  an entire compliance program does, repeatedly, over time, across all controls.
- **Control Lifecycle** (existing `DIAGRAM_LIBRARY.md` entry) is the **per-control** cycle —
  it describes what happens to one individual control as it's designed, built, and reviewed.

The Control Lifecycle nests inside the Compliance Lifecycle's **Implement** stage: every
time the program-level cycle reaches "Implement," each individual control being implemented
or updated runs its own Design → Implement → Test → Evidence → Review pass. This file does
not modify the existing Control Lifecycle entry — it adds the missing program-level diagram
above it.
