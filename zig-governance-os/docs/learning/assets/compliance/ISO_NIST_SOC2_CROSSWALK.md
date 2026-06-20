# ISO ↔ NIST ↔ SOC 2 Crosswalk (detail)

> Content spec only — no rendering, no code, no schema change. Describes the visual asset
> for content-design purposes; actual rendering is a separate, not-yet-scheduled wave.

## Purpose
Show learners that a single control intent can be expressed across three different
compliance frameworks' vocabularies — the visual proof behind CLAUDE.md's "frameworks are
metadata, never hardcoded" rule. This is the detail file for the asset already indexed in
`FRAMEWORK_MAP_LIBRARY.md` as **"ISO ↔ NIST ↔ SOC 2 Crosswalk"** under `## Compliance`.

## Visual structure
One row per equivalent control intent, three framework columns plus a plain-language
description:

| Control Intent | ISO 27001 Annex A | NIST CSF Subcategory | SOC 2 Trust Services Criterion |
|---|---|---|---|
| Logical access is restricted to authorized users | A.9.2.1 (User registration and de-registration) | PR.AC-1 (Identities and credentials are issued, managed, verified, revoked, and audited) | CC6.1 (Logical and physical access controls) |

### Worked example (expanded)
| Field | Value |
|---|---|
| Control intent | "Access to production systems is restricted to authorized personnel and reviewed periodically" |
| ISO 27001 | A.9.2.1 — User registration and de-registration; A.9.2.5 — Review of user access rights |
| NIST CSF | PR.AC-1 — Identities and credentials are managed; PR.AC-4 — Access permissions are managed |
| SOC 2 | CC6.1 — Logical access security; CC6.2 — Access is removed/modified in a timely manner |
| Evidence that satisfies all three | Quarterly access review report, signed off by the system owner, showing additions/removals reconciled against HR termination data |

This single evidence artifact, properly tagged, satisfies all three framework rows at once
— the point the diagram is meant to teach.

## Used by
- `compliance/02_*`, `compliance/03_*` (per `FRAMEWORK_MAP_LIBRARY.md`)
- `docs/scenarios/CLOUDPAY.md` (related scenario-specific instance: "CloudPay ISO 27001 ↔
  SOC 2 Crosswalk")

## Reconciliation
This file expands the existing `FRAMEWORK_MAP_LIBRARY.md` entry "ISO ↔ NIST ↔ SOC 2
Crosswalk" with a worked example row — it does not introduce a new named asset. The name,
lesson references, and column structure are reused as-is from the library.
