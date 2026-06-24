# Security Overview Model (Batch 33)

## Purpose

Security Overview is the first thing a prospect sees at `/trust/{slug}`. It must convey
genuine security posture without exposing internals that would help an attacker or
breach confidentiality with customers/auditors who haven't signed an NDA.

## What it shows externally

1. **A single trust indicator**, not a raw number. Internally, `TRUST_SCORE_MODEL.md`
   (PR #7) defines:

   ```
   TrustScore = 0.15*GovernanceComponent + 0.15*RiskComponent + 0.20*ControlsComponent
              + 0.20*EvidenceComponent + 0.10*AuditComponent + 0.10*VendorComponent
              + 0.10*AIGovernanceComponent
   ```

   Externally, Security Overview shows a **banded label** derived from the same score,
   not the raw composite:

   | Internal TrustScore range | External label |
   |---|---|
   | 90-100 | "Strong" |
   | 75-89 | "Established" |
   | 50-74 | "Developing" |
   | below 50 | not published (Security Overview section disabled for that tenant until score improves) |

   This banding is the deliberate boundary between internal explainability (every score
   must say why, per CLAUDE.md) and external safety (a precise number invites
   reverse-engineering of which control families are weak). The full breakdown remains
   visible internally exactly as PR #7 specified — banding applies only to the
   externally rendered value.

2. **Control family status**, sourced from `PublishedControl` (Batch 32), itself a
   rollup of `controls` rows. Shown as a checklist of family names with
   `implemented` / `in_progress` / `not_applicable` — never the individual control
   descriptions, owners, or remediation status that exist internally on `controls` and
   `risk_assessments`.

3. **Certifications held**, sourced from `PublishedCertification`, itself reading
   `frameworks` (reuse). Shown as badges with issuer and valid-through date.

4. **A qualitative summary statement**, generated the same way the AI Command Center
   generates any other explainable output (CLAUDE.md's "every recommendation needs a
   reason, supporting data, confidence level" rule) — but the "reason" and "supporting
   data" surfaced here must themselves be external-safe content (only the banded label,
   control family names, and certification names — never raw evidence text or
   risk-assessment detail).

## What it never shows

- Raw `TrustScore`/`GovernanceScore` numeric value, or any individual component score.
- Individual control names, control owners, or implementation detail.
- Risk register contents, risk ratings, or risk treatment plans (`risks`,
  `risk_assessments` are never queried by this section at all — Security Overview's
  service layer has no read path to those tables).
- Audit findings or audit report content (that lives behind `PublishedDocument` with
  `exposure_tier = nda_required`, surfaced only via Compliance Center + Customer
  Assurance Portal, never directly here).
- Evidence content of any kind (Evidence Center's job, not Security Overview's).

## Derivation pipeline

```
governance_scores (existing table, read-only)
        │
        ▼
GovernanceService.getScore(tenantId)   (existing, reused)
        │
        ▼
TrustCenterService.deriveSecurityOverview(tenantId)   (new, Batch 32's TrustCenterService)
        │  — applies banding table above
        │  — joins PublishedControl + PublishedCertification (both already filtered
        │    to is_published = true at write time, so no extra filtering needed at read time)
        ▼
GET /trust/{slug} (public route, read-only, no tenant session)
```

`TrustCenterService` never writes to `governance_scores` — it is a pure read/projection
layer. If the score changes (e.g. a control's evidence expires per
`EVIDENCE_HEALTH_MODEL.md`), the next Security Overview render simply reflects the new
band; there is no separate "Trust Center score" to keep in sync, eliminating an entire
class of staleness bugs that a snapshot table would introduce.

## Explainability boundary

CLAUDE.md requires every governance score to be explainable internally ("every score
states why it exists, what affects it, and how to improve it"). Security Overview keeps
that promise for the **tenant** (who can see the full unbanded breakdown on their own
admin-side Trust Center configuration screen, reusing the existing internal Governance
Score detail view) while presenting only the band externally. The explainability
requirement is satisfied at the data-owner level, not by exposing the explanation to
every anonymous visitor — this is the standard "internal explainability, external
summary" pattern used consistently across Batch 33-36.
