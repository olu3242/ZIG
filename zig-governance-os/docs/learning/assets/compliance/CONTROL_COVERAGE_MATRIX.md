# Control Coverage Matrix (Compliance track detail)

> Content spec only — no rendering, no code, no schema change.

## Purpose
Show every control mapped against every framework it satisfies, with the rationale for
each mapping. This is the same named asset already indexed in `FRAMEWORK_MAP_LIBRARY.md`
under `## Security Governance` as **"Control Coverage Matrix"** — it is being referenced
here, not redefined.

**This Compliance-track version is the same asset reused across two tracks.** There is
intentionally no second, separate "Control Coverage Matrix" definition for Compliance — the
matrix's content (control ↔ framework ↔ rationale) is identical regardless of which track's
lesson links to it.

## Visual structure
| Control | ISO 27001 | NIST CSF | SOC 2 | PCI DSS | Rationale |
|---|---|---|---|---|---|
| MFA on privileged accounts | A.9.4.2 | PR.AC-7 | CC6.1 | Req. 8.3 | One technical control, four framework citations, one piece of evidence |
| Encrypted backups | A.8.2.3 | PR.DS-1 | CC6.7 | Req. 3.4 | Backup encryption config + key rotation log |

Each row = one control. Each framework column = a citation if that control satisfies a
requirement in that framework, blank if not applicable. The rationale column is the
plain-language justification an auditor would accept.

## Used by
- `security_governance/02_*`, `security_governance/04_*` (original definition, per
  `FRAMEWORK_MAP_LIBRARY.md`)
- Compliance-track lessons that reference framework coverage by control (no separate
  lesson-anchor list maintained here — see the library entry as the single source of truth
  for "used by")

## Reconciliation
This is **not** a new asset. It is a cross-reference back to `FRAMEWORK_MAP_LIBRARY.md`'s
existing "Control Coverage Matrix" entry under Security Governance, explicitly noted as
shared/reused rather than duplicated for the Compliance track.
