# Questionnaire OS — Approval Matrix

> Batch 18. Who can approve what, and the gate condition for final Approval.

## Role-to-stage matrix

Reuses the existing role vocabulary from CLAUDE.md's multi-tenant model
(`CLAUDE.md:100-102`: Organization Admin, GRC Manager, Risk Analyst, Compliance Analyst,
Auditor, Consultant, Viewer) rather than inventing new roles for Questionnaire OS.

| TrustReview stage | Eligible roles |
|---|---|
| Compliance | Compliance Analyst, GRC Manager, Organization Admin |
| Security | GRC Manager, Organization Admin (no dedicated "Security Analyst" role exists in CLAUDE.md's role list — flagged here as a gap consistent with `TRUST_TAXONOMY.md`'s finding that Security is covered as a control domain but has no role distinct from GRC Manager) |
| Legal | Organization Admin only (no Legal role exists in CLAUDE.md's role list either — same gap pattern) |
| Final Approval | Organization Admin only |

Viewer and Consultant roles can read review state but cannot transition any `TrustReview` or
`Approval` row — consistent with CLAUDE.md's tenant-isolation/RBAC requirement
(`CLAUDE.md:100-103`).

## Gate condition for final Approval

```
Approval.status may transition to 'approved' only if:
  count(TrustReview where questionnaire_id = X and status != 'approved') == 0
```

If any required stage is still `pending` or `changes_requested`, the Approval row stays
`pending` and the UI (Batch 20's Review Queue) must show exactly which stage is blocking,
never a generic "not ready."

## Gap flagged, not solved, here

CLAUDE.md's role list has no dedicated Security or Legal role. This document does not invent
one — it notes the gap and assigns those review stages to the closest existing role
(Organization Admin / GRC Manager) so the workflow is usable today, and flags that a future
RBAC extension (out of scope for this docs-only batch) may want dedicated Security/Legal
reviewer roles.
