# MITRE ATT&CK Mapping Tables (Detail Spec)

## Purpose
Detail spec reusing the existing "MITRE Mapping Table" from `TABLE_LIBRARY.md`. This is a
content spec only — no rendering implementation.

## Structure

| Threat Technique (MITRE ATT&CK ID) | Affected Asset | Control Mitigating It |
|---|---|---|
| T1566 (Phishing) | Employee email / endpoint | Email filtering, security awareness training |
| T1078 (Valid Accounts) | Identity provider | MFA, privileged access review |
| T1486 (Data Encrypted for Impact) | File servers, backups | Immutable backups, EDR |

(Columns reused exactly as indexed — examples illustrative, not exhaustive.)

## Used by
- `security_governance/02_*`
- Cross-references `TABLE_LIBRARY.md` → "MITRE Mapping Table"

## Reconciliation
This is a direct reuse of `TABLE_LIBRARY.md`'s existing "MITRE Mapping Table" entry — same
three columns (Threat Technique / Affected Asset / Control Mitigating It). No new columns
or structure introduced; this file adds illustrative example rows for the detail-level spec.
