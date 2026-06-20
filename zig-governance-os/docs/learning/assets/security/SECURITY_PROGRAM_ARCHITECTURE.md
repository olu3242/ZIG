# Security Program Architecture (Detail Spec)

## Purpose
New asset describing a layered security program architecture diagram, distinct from the
threat-flow and incident-lifecycle diagrams already indexed. This is a content spec only —
no rendering implementation.

## Structure

```
┌───────────────────────────────────────────────┐
│ Governance Layer                               │
│ Policy, risk appetite, board/exec oversight,   │
│ security strategy                              │
└───────────────────┬─────────────────────────────┘
                     │
┌───────────────────┴─────────────────────────────┐
│ Control Layer                                  │
│ Standards, control framework (e.g. ISO 27001    │
│ Annex A, NIST CSF), control owners              │
└───────────────────┬─────────────────────────────┘
                     │
┌───────────────────┴─────────────────────────────┐
│ Technical Layer                                │
│ Tooling — SIEM, EDR, vulnerability scanners,    │
│ IAM, firewalls, encryption                      │
└───────────────────────────────────────────────┘
```

Each layer depends on the one above it: technical controls implement the control-layer
standards, which in turn implement governance-layer policy and risk appetite. The diagram
teaches that security tooling alone is not a program — it must trace upward to governance.

## Used by
- `security_governance/01_*` (proposed — see follow-up note below)

## Reconciliation
This is a **new asset**, not currently indexed in `DIAGRAM_LIBRARY.md`. It is distinct from
"Threat Flow" (which traces an attack path) and "Incident Lifecycle" (which traces a
response cycle) — this diagram instead shows the static structure of a security program
itself. Should be added to `DIAGRAM_LIBRARY.md`'s Security Governance section as a
follow-up; this file does not edit that library doc.
