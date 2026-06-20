# Threat Flow Diagrams (Detail Spec)

## Purpose
Detail spec reusing the existing "Threat Flow" diagram from `DIAGRAM_LIBRARY.md`. This is a
content spec only — no rendering implementation.

## Structure

```
Threat Actor → Vector → Vulnerability → Asset → Impact
```

| Stage | Example |
|---|---|
| Threat Actor | External attacker, malicious insider, nation-state |
| Vector | Phishing email, exposed RDP port, compromised third-party |
| Vulnerability | Unpatched CVE, missing MFA, misconfigured S3 bucket |
| Asset | Customer database, payment processing system, endpoint |
| Impact | Data breach, service outage, regulatory fine |

## Used by
- `security_governance/02_*`
- Cross-references `DIAGRAM_LIBRARY.md` → "Threat Flow"

## Reconciliation
Direct reuse of `DIAGRAM_LIBRARY.md`'s existing "Threat Flow" entry ("Threat actor → Vector
→ Vulnerability → Asset → Impact") — no change to the depicted stages, just the detailed
text rendering spec and illustrative examples the indexed entry did not yet have.
